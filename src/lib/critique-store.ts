import type { Critique } from "./types";
import { createClient } from "./supabase/client";

const STORAGE_KEY = "critiqo_critiques";

export interface CritiqueStore {
  getAll(): Promise<Critique[]>;
  getByMovieId(movieId: number, mediaType?: string): Promise<Critique | null>;
  save(critique: Critique): Promise<void>;
  delete(movieId: number, mediaType?: string): Promise<void>;
}

export class LocalCritiqueStore implements CritiqueStore {
  private read(): Critique[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const items = raw ? (JSON.parse(raw) as Critique[]) : [];
      return items.map((c) => ({ ...c, mediaType: c.mediaType ?? "movie" }));
    } catch {
      return [];
    }
  }

  private write(critiques: Critique[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(critiques));
  }

  async getAll(): Promise<Critique[]> {
    return this.read().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getByMovieId(movieId: number, mediaType = "movie"): Promise<Critique | null> {
    return this.read().find((c) => c.movieId === movieId && (c.mediaType ?? "movie") === mediaType) ?? null;
  }

  async save(critique: Critique): Promise<void> {
    const critiques = this.read();
    const idx = critiques.findIndex(
      (c) => c.movieId === critique.movieId && (c.mediaType ?? "movie") === (critique.mediaType ?? "movie")
    );
    if (idx >= 0) {
      critiques[idx] = critique;
    } else {
      critiques.push(critique);
    }
    this.write(critiques);
  }

  async delete(movieId: number, mediaType = "movie"): Promise<void> {
    const critiques = this.read().filter(
      (c) => !(c.movieId === movieId && (c.mediaType ?? "movie") === mediaType)
    );
    this.write(critiques);
  }
}

export class SupabaseCritiqueStore implements CritiqueStore {
  private get supabase() {
    return createClient();
  }

  async getAll(): Promise<Critique[]> {
    const { data, error } = await this.supabase
      .from("critiques")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapRow);
  }

  async getByMovieId(movieId: number, mediaType = "movie"): Promise<Critique | null> {
    const { data, error } = await this.supabase
      .from("critiques")
      .select("*")
      .eq("media_id", movieId)
      .eq("media_type", mediaType)
      .maybeSingle();

    if (error) throw error;
    return data ? mapRow(data) : null;
  }

  async save(critique: Critique): Promise<void> {
    const { error } = await this.supabase.from("critiques").upsert(
      {
        user_id: (await this.supabase.auth.getUser()).data.user!.id,
        media_id: critique.movieId,
        media_type: critique.mediaType ?? "movie",
        title: critique.title,
        poster_path: critique.posterPath,
        release_year: critique.releaseYear,
        genres: critique.genres,
        ratings: critique.ratings,
        score: critique.score,
        created_at: critique.createdAt,
        updated_at: critique.updatedAt,
      },
      { onConflict: "user_id,media_id,media_type" }
    );
    if (error) throw error;
  }

  async delete(movieId: number, mediaType = "movie"): Promise<void> {
    const userId = (await this.supabase.auth.getUser()).data.user!.id;
    const { error } = await this.supabase
      .from("critiques")
      .delete()
      .eq("user_id", userId)
      .eq("media_id", movieId)
      .eq("media_type", mediaType);
    if (error) throw error;
  }
}

function mapRow(row: Record<string, unknown>): Critique {
  return {
    movieId: row.media_id as number,
    mediaType: (row.media_type as "movie" | "tv") ?? "movie",
    title: row.title as string,
    posterPath: row.poster_path as string | null,
    releaseYear: row.release_year as string,
    genres: row.genres as string[],
    ratings: row.ratings as Critique["ratings"],
    score: row.score as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const localCritiqueStore: CritiqueStore = new LocalCritiqueStore();

let _supabaseCritiqueStore: CritiqueStore | null = null;
export function getSupabaseCritiqueStore(): CritiqueStore {
  if (!_supabaseCritiqueStore) {
    _supabaseCritiqueStore = new SupabaseCritiqueStore();
  }
  return _supabaseCritiqueStore;
}
