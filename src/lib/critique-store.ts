import type { Critique } from "./types";

const STORAGE_KEY = "critiqo_critiques";

export interface CritiqueStore {
  getAll(): Critique[];
  getByMovieId(movieId: number): Critique | null;
  save(critique: Critique): void;
  delete(movieId: number): void;
}

export class LocalCritiqueStore implements CritiqueStore {
  private read(): Critique[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Critique[]) : [];
    } catch {
      return [];
    }
  }

  private write(critiques: Critique[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(critiques));
  }

  getAll(): Critique[] {
    return this.read().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  getByMovieId(movieId: number): Critique | null {
    return this.read().find((c) => c.movieId === movieId) ?? null;
  }

  save(critique: Critique): void {
    const critiques = this.read();
    const idx = critiques.findIndex((c) => c.movieId === critique.movieId);
    if (idx >= 0) {
      critiques[idx] = critique;
    } else {
      critiques.push(critique);
    }
    this.write(critiques);
  }

  delete(movieId: number): void {
    const critiques = this.read().filter((c) => c.movieId !== movieId);
    this.write(critiques);
  }
}

export const critiqueStore: CritiqueStore = new LocalCritiqueStore();
