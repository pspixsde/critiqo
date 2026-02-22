import Image from "next/image";
import { notFound } from "next/navigation";
import { getMovieDetails, getMovieCredits, backdropUrl, posterUrl } from "@/lib/tmdb";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Calendar } from "lucide-react";
import { MediaActions } from "@/components/media-actions";
import { CastCrew } from "@/components/cast-crew";
import { ReviewSection } from "@/components/review-section";
import type { TMDBMovie } from "@/lib/types";

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movieId = parseInt(id, 10);
  if (isNaN(movieId)) notFound();

  let movie, credits;
  try {
    [movie, credits] = await Promise.all([
      getMovieDetails(movieId),
      getMovieCredits(movieId),
    ]);
  } catch {
    notFound();
  }

  const backdrop = backdropUrl(movie.backdrop_path, "w1280");
  const poster = posterUrl(movie.poster_path, "w500");
  const year = movie.release_date?.split("-")[0] ?? "";

  const tmdbMovie: TMDBMovie = {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date,
    genre_ids: movie.genres.map((g) => g.id),
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    popularity: movie.popularity,
  };

  return (
    <main>
      {/* Hero */}
      <div className="relative h-[350px] w-full overflow-hidden sm:h-[420px]">
        {backdrop ? (
          <Image
            src={backdrop}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto flex max-w-5xl items-end gap-6 px-4 pb-6">
            {poster && (
              <div className="relative hidden h-56 w-40 shrink-0 overflow-hidden rounded-lg shadow-2xl sm:block">
                <Image src={poster} alt={movie.title} fill className="object-cover" sizes="160px" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-sm italic text-muted-foreground">{movie.tagline}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {year}
                  </span>
                )}
                {movie.runtime && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {movie.genres.map((g) => (
                  <Badge key={g.id} variant="secondary" className="text-xs">
                    {g.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <MediaActions
          media={tmdbMovie}
          mediaType="movie"
          title={movie.title}
          posterPath={movie.poster_path}
        />

        {movie.overview && (
          <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">Overview</h2>
            <p className="leading-relaxed text-muted-foreground">{movie.overview}</p>
          </div>
        )}

        <Separator className="my-8" />

        <CastCrew credits={credits} />

        <Separator className="my-8" />

        <ReviewSection mediaId={movie.id} mediaType="movie" />
      </div>
    </main>
  );
}
