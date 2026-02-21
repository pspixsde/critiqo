"use client";

import { useCallback, useSyncExternalStore } from "react";
import { critiqueStore } from "@/lib/critique-store";
import type { Critique } from "@/lib/types";

let listeners: (() => void)[] = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

let snapshotCache: Critique[] | null = null;
let snapshotVersion = 0;

function getSnapshot(): Critique[] {
  if (snapshotCache === null) {
    snapshotCache = critiqueStore.getAll();
  }
  return snapshotCache;
}

function getServerSnapshot(): Critique[] {
  return [];
}

function invalidateCache() {
  snapshotCache = null;
  snapshotVersion++;
  emitChange();
}

export function useCritiques() {
  const critiques = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const saveCritique = useCallback((critique: Critique) => {
    critiqueStore.save(critique);
    invalidateCache();
  }, []);

  const deleteCritique = useCallback((movieId: number) => {
    critiqueStore.delete(movieId);
    invalidateCache();
  }, []);

  const getCritique = useCallback((movieId: number) => {
    return critiqueStore.getByMovieId(movieId);
  }, []);

  return {
    critiques,
    saveCritique,
    deleteCritique,
    getCritique,
  };
}
