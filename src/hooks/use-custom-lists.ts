"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";

export interface CustomList {
  id: string;
  name: string;
  itemCount: number;
}

export interface CustomListItem {
  id: string;
  listId: string;
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  addedAt: string;
}

export function useCustomLists() {
  const { user, loading: authLoading } = useAuth();
  const [lists, setLists] = useState<CustomList[]>([]);
  const [loading, setLoading] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      return;
    }
    let cancelled = false;

    async function load() {
      setLoading(true);
      const supabase = createClient();
      const [{ data: rawLists, error: listError }, { data: items, error: itemsError }] =
        await Promise.all([
          supabase
            .from("custom_lists")
            .select("id,name")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true }),
          supabase.from("custom_list_items").select("list_id"),
        ]);

      if (listError || itemsError) {
        console.error("Failed to load custom lists:", listError ?? itemsError);
        if (!cancelled) setLoading(false);
        return;
      }

      if (!cancelled) {
        const countMap = new Map<string, number>();
        (items as Array<{ list_id: string }> | null)?.forEach((item) => {
          countMap.set(item.list_id, (countMap.get(item.list_id) ?? 0) + 1);
        });
        const parsed = (rawLists as Array<{ id: string; name: string }> | null)?.map((list) => ({
          id: list.id,
          name: list.name,
          itemCount: countMap.get(list.id) ?? 0,
        }));
        setLists(parsed ?? []);
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, version]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const createList = useCallback(
    async (name: string) => {
      if (!user) return;
      const clean = name.trim();
      if (!clean) return;
      const supabase = createClient();
      const { error } = await supabase.from("custom_lists").insert({ user_id: user.id, name: clean });
      if (error) throw error;
      refresh();
    },
    [user, refresh]
  );

  const renameList = useCallback(
    async (id: string, newName: string) => {
      if (!user) return;
      const clean = newName.trim();
      if (!clean) return;
      const supabase = createClient();
      const { error } = await supabase
        .from("custom_lists")
        .update({ name: clean, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      refresh();
    },
    [user, refresh]
  );

  const deleteList = useCallback(
    async (id: string) => {
      if (!user) return;
      const supabase = createClient();
      const { error } = await supabase.from("custom_lists").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      refresh();
    },
    [user, refresh]
  );

  const getListItems = useCallback(async (listId: string): Promise<CustomListItem[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("custom_list_items")
      .select("*")
      .eq("list_id", listId)
      .order("added_at", { ascending: false });
    if (error) throw error;
    return ((data as Record<string, unknown>[] | null) ?? []).map((row) => ({
      id: row.id as string,
      listId: row.list_id as string,
      mediaId: row.media_id as number,
      mediaType: row.media_type as "movie" | "tv",
      title: row.title as string,
      posterPath: (row.poster_path as string | null) ?? null,
      addedAt: row.added_at as string,
    }));
  }, []);

  const getListsContainingMedia = useCallback(
    async (mediaId: number, mediaType: "movie" | "tv") => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("custom_list_items")
        .select("list_id")
        .eq("media_id", mediaId)
        .eq("media_type", mediaType);
      if (error) throw error;
      return new Set(((data as Array<{ list_id: string }> | null) ?? []).map((row) => row.list_id));
    },
    []
  );

  const addToList = useCallback(
    async (
      listId: string,
      item: { mediaId: number; mediaType: "movie" | "tv"; title: string; posterPath: string | null }
    ) => {
      const supabase = createClient();
      const { error } = await supabase.from("custom_list_items").upsert(
        {
          list_id: listId,
          media_id: item.mediaId,
          media_type: item.mediaType,
          title: item.title,
          poster_path: item.posterPath,
        },
        { onConflict: "list_id,media_id,media_type" }
      );
      if (error) throw error;
      refresh();
    },
    [refresh]
  );

  const removeFromList = useCallback(
    async (listId: string, mediaId: number, mediaType: "movie" | "tv") => {
      const supabase = createClient();
      const { error } = await supabase
        .from("custom_list_items")
        .delete()
        .eq("list_id", listId)
        .eq("media_id", mediaId)
        .eq("media_type", mediaType);
      if (error) throw error;
      refresh();
    },
    [refresh]
  );

  const effectiveLists = useMemo(() => (authLoading || !user ? [] : lists), [authLoading, user, lists]);

  return {
    lists: effectiveLists,
    loading,
    createList,
    renameList,
    deleteList,
    getListItems,
    getListsContainingMedia,
    addToList,
    removeFromList,
    refresh,
  };
}
