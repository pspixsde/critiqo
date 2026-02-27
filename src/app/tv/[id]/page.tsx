import Image from "next/image";
import { notFound } from "next/navigation";
import { getTVDetails, getTVCredits, backdropUrl, posterUrl } from "@/lib/tmdb";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Layers } from "lucide-react";
import { MediaActions } from "@/components/media-actions";
import { CastCrew } from "@/components/cast-crew";
import { ReviewSection } from "@/components/review-section";
import { TVSeasonsInfo } from "@/components/tv-seasons-info";
import type { TMDBMovie } from "@/lib/types";

export default async function TVPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tvId = parseInt(id, 10);
  if (isNaN(tvId)) notFound();

  let show, credits;
  try {
    [show, credits] = await Promise.all([
      getTVDetails(tvId),
      getTVCredits(tvId),
    ]);
  } catch {
    notFound();
  }

  const backdrop = backdropUrl(show.backdrop_path, "w1280");
  const poster = posterUrl(show.poster_path, "w500");
  const firstYear = show.first_air_date?.split("-")[0] ?? "";
  const lastYear = show.last_air_date?.split("-")[0] ?? "";
  const yearRange = firstYear
    ? show.status === "Returning Series"
      ? `${firstYear} - ...`
      : lastYear && lastYear !== firstYear
        ? `${firstYear} - ${lastYear}`
        : firstYear
    : "";

  const tmdbMovie: TMDBMovie = {
    id: show.id,
    title: show.name,
    overview: show.overview,
    poster_path: show.poster_path,
    backdrop_path: show.backdrop_path,
    release_date: show.first_air_date,
    genre_ids: show.genres.map((g) => g.id),
    vote_average: show.vote_average,
    vote_count: show.vote_count,
    popularity: show.popularity,
  };

  return (
    <main>
      {/* Hero */}
      <div className="relative h-[350px] w-full overflow-hidden sm:h-[420px]">
        {backdrop ? (
          <Image
            src={backdrop}
            alt={show.name}
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
                <Image src={poster} alt={show.name} fill className="object-cover" sizes="160px" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                {show.name}
              </h1>
              {show.tagline && (
                <p className="text-sm italic text-muted-foreground">{show.tagline}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {yearRange && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {yearRange}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5" />
                  {show.number_of_seasons} season{show.number_of_seasons !== 1 ? "s" : ""}
                  {" \u00B7 "}
                  {show.number_of_episodes} episode{show.number_of_episodes !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {show.genres.map((g) => (
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
      <div className="mx-auto max-w-5xl animate-in fade-in duration-300 px-4 py-8">
        <MediaActions
          media={tmdbMovie}
          mediaType="tv"
          title={show.name}
          posterPath={show.poster_path}
        />

        {show.overview && (
          <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">Overview</h2>
            <p className="leading-relaxed text-muted-foreground">{show.overview}</p>
          </div>
        )}

        <Separator className="my-8" />

        <TVSeasonsInfo tvId={show.id} seasons={show.seasons} />

        <Separator className="my-8" />

        <CastCrew credits={credits} />

        <Separator className="my-8" />

        <ReviewSection mediaId={show.id} mediaType="tv" />
      </div>
    </main>
  );
}
