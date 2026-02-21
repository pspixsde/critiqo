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
  title: string;
  posterPath: string | null;
  releaseYear: string;
  genres: string[];
  ratings: CritiqueRatings;
  score: number;
  createdAt: string;
  updatedAt: string;
}

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

export function getGenreNames(genreIds: number[]): string[] {
  return genreIds.map((id) => TMDB_GENRE_MAP[id]).filter(Boolean);
}

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
