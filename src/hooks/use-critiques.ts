"use client";

import { useCallback, useEffect, useState } from "react";
import { localCritiqueStore, getSupabaseCritiqueStore } from "@/lib/critique-store";
import type { Critique } from "@/lib/types";
import { useAuth } from "@/components/auth-provider";

export function useCritiques() {
  const { user } = useAuth();
  const [critiques, setCritiques] = useState<Critique[]>([]);
  const [version, setVersion] = useState(0);

  const store = user ? getSupabaseCritiqueStore() : localCritiqueStore;

  useEffect(() => {
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
  }, [store, version]);

  const saveCritique = useCallback(
    async (critique: Critique) => {
      await store.save(critique);
      setVersion((v) => v + 1);
    },
    [store]
  );

  const deleteCritique = useCallback(
    async (movieId: number, mediaType = "movie") => {
      await store.delete(movieId, mediaType);
      setVersion((v) => v + 1);
    },
    [store]
  );

  const getCritique = useCallback(
    async (movieId: number, mediaType = "movie") => {
      return store.getByMovieId(movieId, mediaType);
    },
    [store]
  );

  return {
    critiques,
    saveCritique,
    deleteCritique,
    getCritique,
  };
}
