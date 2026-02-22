"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";

export function useUninterested() {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!user) {
      setIds(new Set());
      return;
    }
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("uninterested")
        .select("media_id, media_type")
        .eq("user_id", user!.id);

      if (error) {
        console.error("Failed to load uninterested:", error);
        return;
      }

      if (!cancelled && data) {
        setIds(
          new Set(
            (data as { media_id: number; media_type: string }[]).map(
              (r) => `${r.media_type}-${r.media_id}`
            )
          )
        );
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user, version]);

  const isUninterested = useCallback(
    (mediaId: number, mediaType: "movie" | "tv" = "movie") =>
      ids.has(`${mediaType}-${mediaId}`),
    [ids]
  );

  const markUninterested = useCallback(
    async (mediaId: number, mediaType: "movie" | "tv" = "movie") => {
      if (!user) return;
      const supabase = createClient();
      const { error } = await supabase.from("uninterested").upsert(
        {
          user_id: user.id,
          media_id: mediaId,
          media_type: mediaType,
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

  return { isUninterested, markUninterested, removeUninterested };
}
