"use client";

import { useCallback, useEffect, useState } from "react";
import { localCritiqueStore, getSupabaseCritiqueStore } from "@/lib/critique-store";
import type { Critique } from "@/lib/types";
import { useAuth } from "@/components/auth-provider";

export function useCritiques() {
  const { user, loading } = useAuth();
  const [critiques, setCritiques] = useState<Critique[]>([]);
  const [version, setVersion] = useState(0);

  const store = user ? getSupabaseCritiqueStore() : localCritiqueStore;

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    store
      .getAll()
      .then((data) => {
        if (!cancelled) setCritiques(data);
      })
      .catch((err) => {
        console.error("Failed to load critiques:", err);
      });
    return () => {
      cancelled = true;
    };
  }, [store, version, loading]);

  const saveCritique = useCallback(
    async (critique: Critique) => {
      if (loading) return;
      await store.save(critique);
      setVersion((v) => v + 1);
    },
    [store, loading]
  );

  const deleteCritique = useCallback(
    async (movieId: number, mediaType = "movie") => {
      if (loading) return;
      await store.delete(movieId, mediaType);
      setVersion((v) => v + 1);
    },
    [store, loading]
  );

  const getCritique = useCallback(
    async (movieId: number, mediaType = "movie") => {
      if (loading) return null;
      return store.getByMovieId(movieId, mediaType);
    },
    [store, loading]
  );

  return {
    critiques,
    saveCritique,
    deleteCritique,
    getCritique,
  };
}
