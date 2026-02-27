"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";

export function useUninterested() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<
    { mediaId: number; mediaType: "movie" | "tv"; title: string; posterPath: string | null; createdAt: string }[]
  >([]);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("uninterested")
        .select("media_id, media_type, title, poster_path, created_at")
        .eq("user_id", user!.id);

      if (error) {
        console.error("Failed to load uninterested:", error);
        return;
      }

      if (!cancelled && data) {
        setItems(
          (data as Record<string, unknown>[]).map((r) => ({
            mediaId: r.media_id as number,
            mediaType: r.media_type as "movie" | "tv",
            title: (r.title as string) ?? "Unknown",
            posterPath: (r.poster_path as string | null) ?? null,
            createdAt: r.created_at as string,
          }))
        );
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user, version, loading]);

  const effectiveItems = useMemo(() => (!user || loading ? [] : items), [user, loading, items]);

  const isUninterested = useCallback(
    (mediaId: number, mediaType: "movie" | "tv" = "movie") =>
      effectiveItems.some((i) => i.mediaId === mediaId && i.mediaType === mediaType),
    [effectiveItems]
  );

  const markUninterested = useCallback(
    async (
      mediaId: number,
      mediaType: "movie" | "tv" = "movie",
      title?: string,
      posterPath?: string | null
    ) => {
      if (!user) return;
      const supabase = createClient();
      const { error } = await supabase.from("uninterested").upsert(
        {
          user_id: user.id,
          media_id: mediaId,
          media_type: mediaType,
          title: title ?? null,
          poster_path: posterPath ?? null,
        },
        { onConflict: "user_id,media_id,media_type" }
      );
      if (error) {
        console.error("Failed to mark uninterested:", error);
        throw error;
      }
      setVersion((v) => v + 1);
    },
    [user]
  );

  const removeUninterested = useCallback(
    async (mediaId: number, mediaType: "movie" | "tv" = "movie") => {
      if (!user) return;
      const supabase = createClient();
      const { error } = await supabase
        .from("uninterested")
        .delete()
        .eq("user_id", user.id)
        .eq("media_id", mediaId)
        .eq("media_type", mediaType);
      if (error) {
        console.error("Failed to remove uninterested:", error);
        throw error;
      }
      setVersion((v) => v + 1);
    },
    [user]
  );

  return { uninterested: effectiveItems, isUninterested, markUninterested, removeUninterested };
}
