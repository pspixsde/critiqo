import type {
  TMDBSearchResponse,
  TMDBMovieDetails,
  TMDBCredits,
  TMDBTVDetails,
  TMDBMultiSearchResponse,
} from "./types";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || "https://image.tmdb.org/t/p";

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", API_KEY);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ─── Movie endpoints ─────────────────────────────────────────

export async function searchMovies(query: string, page = 1): Promise<TMDBSearchResponse> {
  return tmdbFetch<TMDBSearchResponse>("/search/movie", {
    query,
    page: String(page),
    include_adult: "false",
  });
}

export async function getMovieDetails(id: number): Promise<TMDBMovieDetails> {
  return tmdbFetch<TMDBMovieDetails>(`/movie/${id}`);
}

export async function getMovieCredits(id: number): Promise<TMDBCredits> {
  return tmdbFetch<TMDBCredits>(`/movie/${id}/credits`);
}

export async function getNowPlayingMovies(page = 1): Promise<TMDBSearchResponse> {
  return tmdbFetch<TMDBSearchResponse>("/movie/now_playing", {
    page: String(page),
  });
}

// ─── TV endpoints ────────────────────────────────────────────

export async function getTVDetails(id: number): Promise<TMDBTVDetails> {
  return tmdbFetch<TMDBTVDetails>(`/tv/${id}`);
}

export async function getTVCredits(id: number): Promise<TMDBCredits> {
  return tmdbFetch<TMDBCredits>(`/tv/${id}/credits`);
}

export async function getOnTheAirTV(page = 1): Promise<{ page: number; results: import("./types").TMDBTVShow[]; total_pages: number; total_results: number }> {
  return tmdbFetch("/tv/on_the_air", { page: String(page) });
}

// ─── Multi-search ────────────────────────────────────────────

export async function searchMulti(query: string, page = 1): Promise<TMDBMultiSearchResponse> {
  return tmdbFetch<TMDBMultiSearchResponse>("/search/multi", {
    query,
    page: String(page),
    include_adult: "false",
  });
}

// ─── Image helpers ───────────────────────────────────────────

type PosterSize = "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original";
type BackdropSize = "w300" | "w780" | "w1280" | "original";
type ProfileSize = "w45" | "w185" | "h632" | "original";

export function posterUrl(path: string | null, size: PosterSize = "w342"): string | null {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

export function backdropUrl(path: string | null, size: BackdropSize = "w1280"): string | null {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

export function profileUrl(path: string | null, size: ProfileSize = "w185"): string | null {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
}
