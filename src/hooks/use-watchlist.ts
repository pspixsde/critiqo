"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";

interface WatchlistItem {
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  addedAt: string;
}

export function useWatchlist() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", user!.id)
        .order("added_at", { ascending: false });

      if (error) {
        console.error("Failed to load watchlist:", error);
        return;
      }

      if (!cancelled && data) {
        setItems(
          (data as Record<string, unknown>[]).map((r) => ({
            mediaId: r.media_id as number,
            mediaType: r.media_type as "movie" | "tv",
            title: r.title as string,
            posterPath: r.poster_path as string | null,
            addedAt: r.added_at as string,
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

  const isInWatchlist = useCallback(
    (mediaId: number, mediaType: "movie" | "tv" = "movie") =>
      effectiveItems.some((i) => i.mediaId === mediaId && i.mediaType === mediaType),
    [effectiveItems]
  );

  const addToWatchlist = useCallback(
    async (item: { mediaId: number; mediaType: "movie" | "tv"; title: string; posterPath: string | null }) => {
      if (!user) return;
      const supabase = createClient();
      const { error } = await supabase.from("watchlist").upsert(
        {
          user_id: user.id,
          media_id: item.mediaId,
          media_type: item.mediaType,
          title: item.title,
          poster_path: item.posterPath,
        },
        { onConflict: "user_id,media_id,media_type" }
      );
      if (error) {
        console.error("Failed to add to watchlist:", error);
        throw error;
      }
      setVersion((v) => v + 1);
    },
    [user]
  );

  const removeFromWatchlist = useCallback(
    async (mediaId: number, mediaType: "movie" | "tv" = "movie") => {
      if (!user) return;
      const supabase = createClient();
      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("user_id", user.id)
        .eq("media_id", mediaId)
        .eq("media_type", mediaType);
      if (error) {
        console.error("Failed to remove from watchlist:", error);
        throw error;
      }
      setVersion((v) => v + 1);
    },
    [user]
  );

  return { watchlist: effectiveItems, isInWatchlist, addToWatchlist, removeFromWatchlist };
}
