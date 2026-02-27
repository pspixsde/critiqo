export const CRITIQUE_DIMENSIONS = [
  "story",
  "acting",
  "visuals",
  "directing",
  "music",
] as const;

export type CritiqueDimension = (typeof CRITIQUE_DIMENSIONS)[number];

export type CritiqueRatings = Record<CritiqueDimension, number>;

export interface Critique {
  movieId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseYear: string;
  genres: string[];
  ratings: CritiqueRatings;
  score: number;
  createdAt: string;
  updatedAt: string;
}

// ─── TMDB Movie Types ────────────────────────────────────────

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  popularity: number;
}

export interface TMDBMovieDetails extends Omit<TMDBMovie, "genre_ids"> {
  genres: { id: number; name: string }[];
  runtime: number | null;
  tagline: string | null;
  status: string;
  budget: number;
  revenue: number;
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

// ─── TMDB TV Types ───────────────────────────────────────────

export interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date?: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  popularity: number;
  origin_country: string[];
}

export interface TMDBTVDetails extends Omit<TMDBTVShow, "genre_ids"> {
  genres: { id: number; name: string }[];
  number_of_seasons: number;
  number_of_episodes: number;
  tagline: string | null;
  status: string;
  created_by: { id: number; name: string; profile_path: string | null }[];
  seasons: {
    id: number;
    name: string;
    season_number: number;
    episode_count: number;
    poster_path: string | null;
    air_date: string | null;
  }[];
}

export interface TMDBEpisode {
  id: number;
  name: string;
  episode_number: number;
  air_date: string | null;
}

export interface TMDBSeasonDetails {
  id: number;
  name: string;
  season_number: number;
  air_date: string | null;
  episodes: TMDBEpisode[];
}

// ─── TMDB Multi-Search Types ─────────────────────────────────

export type TMDBMultiSearchResult =
  | (TMDBMovie & { media_type: "movie" })
  | (TMDBTVShow & { media_type: "tv" })
  | { media_type: "person"; id: number; name: string; [key: string]: unknown };

export interface TMDBMultiSearchResponse {
  page: number;
  results: TMDBMultiSearchResult[];
  total_pages: number;
  total_results: number;
}

// ─── TMDB Credits ────────────────────────────────────────────

export interface TMDBCredits {
  id: number;
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }[];
  crew: {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }[];
}

// ─── Unified Media Item ──────────────────────────────────────

export interface MediaItem {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  genreIds: number[];
  voteAverage: number;
  voteCount: number;
  popularity: number;
  lastAirDate?: string;
}

export function toMediaItem(result: TMDBMultiSearchResult): MediaItem | null {
  if (result.media_type === "person") return null;
  if (result.media_type === "movie") {
    return {
      id: result.id,
      mediaType: "movie",
      title: result.title,
      overview: result.overview,
      posterPath: result.poster_path,
      backdropPath: result.backdrop_path,
      releaseDate: result.release_date,
      genreIds: result.genre_ids,
      voteAverage: result.vote_average,
      voteCount: result.vote_count,
      popularity: result.popularity,
    };
  }
  return {
    id: result.id,
    mediaType: "tv",
    title: result.name,
    overview: result.overview,
    posterPath: result.poster_path,
    backdropPath: result.backdrop_path,
    releaseDate: result.first_air_date,
    genreIds: result.genre_ids,
    voteAverage: result.vote_average,
    voteCount: result.vote_count,
    popularity: result.popularity,
    lastAirDate: result.last_air_date,
  };
}

export function formatMediaYear(item: MediaItem): string {
  const first = item.releaseDate?.split("-")[0] ?? "";
  if (item.mediaType !== "tv") return first;
  if (!first) return "";
  const last = item.lastAirDate?.split("-")[0] ?? "";
  if (!last || last === first) return first;
  return `${first} - ${last}`;
}

// ─── Genre Maps ──────────────────────────────────────────────

export const TMDB_GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

export const TMDB_TV_GENRE_MAP: Record<number, string> = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
};

export function getGenreNames(genreIds: number[], mediaType: "movie" | "tv" = "movie"): string[] {
  const map = mediaType === "tv" ? { ...TMDB_GENRE_MAP, ...TMDB_TV_GENRE_MAP } : TMDB_GENRE_MAP;
  return genreIds.map((id) => map[id]).filter(Boolean);
}

// ─── Review Types ────────────────────────────────────────────

export type ReviewSentiment = "positive" | "neutral" | "negative";

export interface Review {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  mediaId: number;
  mediaType: "movie" | "tv";
  content: string;
  sentiment: ReviewSentiment;
  helpfulCount: number;
  unhelpfulCount: number;
  userVote: 1 | -1 | null;
  createdAt: string;
  updatedAt: string;
}

export type ReviewFilter = "all" | "positive" | "neutral" | "negative";
export type ReviewSort = "rating" | "recent";

// ─── Score Utilities ─────────────────────────────────────────

export function computeScore(ratings: CritiqueRatings): number {
  const sum = Object.values(ratings).reduce((a, b) => a + b, 0);
  return sum * 4;
}

export function getEmptyRatings(): CritiqueRatings {
  return {
    story: 0,
    acting: 0,
    visuals: 0,
    directing: 0,
    music: 0,
  };
}
