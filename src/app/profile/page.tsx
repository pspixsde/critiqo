"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MovieCard } from "@/components/movie-card";
import { ScoreBadge } from "@/components/score-badge";
import { CritiqueDialog } from "@/components/critique-dialog";
import { useCritiques } from "@/hooks/use-critiques";
import { useAuth } from "@/components/auth-provider";
import { CRITIQUE_DIMENSIONS, type TMDBMovie, type CritiqueDimension } from "@/lib/types";
import { BarChart3, Film, Trophy, TrendingDown } from "lucide-react";

export default function ProfilePage() {
  const { critiques } = useCritiques();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<"movie" | "tv">("movie");
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!loading && !user) {
    router.push("/auth");
    return null;
  }

  const stats = useMemo(() => {
    if (critiques.length === 0) return null;

    const avgScore = Math.round(
      critiques.reduce((sum, c) => sum + c.score, 0) / critiques.length
    );

    const dimensionAverages: Record<CritiqueDimension, number> = {} as Record<CritiqueDimension, number>;
    for (const dim of CRITIQUE_DIMENSIONS) {
      dimensionAverages[dim] = parseFloat(
        (critiques.reduce((sum, c) => sum + c.ratings[dim], 0) / critiques.length).toFixed(1)
      );
    }

    const sorted = [...critiques].sort((a, b) => b.score - a.score);
    const highest = sorted[0];
    const lowest = sorted[sorted.length - 1];

    const genreCounts: Record<string, number> = {};
    for (const c of critiques) {
      for (const g of c.genres) {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      }
    }
    const topGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return { avgScore, dimensionAverages, highest, lowest, topGenres };
  }, [critiques]);

  const displayName =
    user?.user_metadata?.username ?? user?.email?.split("@")[0] ?? "Critic";

  function handleMovieClick(critique: (typeof critiques)[0]) {
    const movie: TMDBMovie = {
      id: critique.movieId,
      title: critique.title,
      overview: "",
      poster_path: critique.posterPath,
      backdrop_path: null,
      release_date: critique.releaseYear,
      genre_ids: [],
      vote_average: 0,
      vote_count: 0,
      popularity: 0,
    };
    setSelectedMovie(movie);
    setSelectedMediaType(critique.mediaType ?? "movie");
    setDialogOpen(true);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-amber-500/15 text-amber-500 text-xl font-bold">
            {displayName[0]?.toUpperCase() ?? "C"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
          <p className="text-sm text-muted-foreground">
            {critiques.length} {critiques.length === 1 ? "title" : "titles"} critiqued
            {stats && <> &middot; Avg score: {stats.avgScore}/100</>}
          </p>
        </div>
      </div>

      {critiques.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-20">
          <Film className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">No critiques yet. Go rate some movies & shows!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {stats && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <BarChart3 className="h-4 w-4 text-amber-500" />
                  <CardTitle className="text-sm font-medium">Dimension Averages</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {CRITIQUE_DIMENSIONS.map((dim) => (
                    <div key={dim} className="flex items-center gap-2">
                      <span className="w-20 text-xs font-medium capitalize text-muted-foreground">
                        {dim}
                      </span>
                      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-amber-500 transition-all"
                          style={{ width: `${(stats.dimensionAverages[dim] / 5) * 100}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
                        {stats.dimensionAverages[dim]}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <CardTitle className="text-sm font-medium">Highest Rated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <ScoreBadge score={stats.highest.score} size="lg" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{stats.highest.title}</p>
                      <p className="text-xs text-muted-foreground">{stats.highest.releaseYear}</p>
                    </div>
                  </div>
                  {critiques.length > 1 && (
                    <>
                      <Separator className="my-3" />
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Lowest Rated</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <ScoreBadge score={stats.lowest.score} size="md" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{stats.lowest.title}</p>
                          <p className="text-xs text-muted-foreground">{stats.lowest.releaseYear}</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="sm:col-span-2 lg:col-span-1">
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <Film className="h-4 w-4 text-amber-500" />
                  <CardTitle className="text-sm font-medium">Top Genres</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.topGenres.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {stats.topGenres.map(([genre, count]) => (
                        <div key={genre} className="flex items-center justify-between">
                          <span className="text-sm">{genre}</span>
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {count} {count === 1 ? "title" : "titles"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No genre data yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <div>
            <h2 className="mb-4 text-lg font-semibold">Your Critiques</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {critiques.map((critique) => (
                <MovieCard
                  key={`${critique.mediaType ?? "movie"}-${critique.movieId}`}
                  movieId={critique.movieId}
                  title={critique.title}
                  posterPath={critique.posterPath}
                  releaseYear={critique.releaseYear}
                  score={critique.score}
                  onClick={() => handleMovieClick(critique)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <CritiqueDialog
        movie={selectedMovie}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mediaType={selectedMediaType}
      />
    </main>
  );
}
