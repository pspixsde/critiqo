"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getMovieRecommendations, getTopRatedMovies } from "@/lib/tmdb";
import { MovieCard } from "./movie-card";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useCritiques } from "@/hooks/use-critiques";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { CritiqueDialog } from "./critique-dialog";
import type { TMDBMovie } from "@/lib/types";
import { toast } from "sonner";

export function RecommendationsCarousel() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { critiques } = useCritiques();
  const [selected, setSelected] = useState<TMDBMovie | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const movieCritiques = useMemo(
    () =>
      critiques
        .filter((c) => c.mediaType === "movie")
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [critiques]
  );
  const ratedIds = useMemo(() => new Set(movieCritiques.map((c) => c.movieId)), [movieCritiques]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const high8 = movieCritiques.filter((c) => c.score >= 80);
        const high7 = movieCritiques.filter((c) => c.score >= 70);
        const fallbackRated = [...movieCritiques].sort((a, b) => b.score - a.score).slice(0, 4);
        const source = (high8.length >= 2 ? high8 : high7.length >= 2 ? high7 : fallbackRated).slice(0, 4);

        if (source.length === 0) {
          const topRated = await getTopRatedMovies();
          if (!cancelled) {
            setMovies(topRated.results.slice(0, 20));
          }
          return;
        }

        const responses = await Promise.all(source.map((c) => getMovieRecommendations(c.movieId)));
        const byId = new Map<number, TMDBMovie>();
        for (const res of responses) {
          for (const m of res.results) {
            if (!ratedIds.has(m.id) && !byId.has(m.id)) {
              byId.set(m.id, m);
            }
          }
        }
        if (!cancelled) {
          setMovies(Array.from(byId.values()).slice(0, 30));
        }
      } catch {
        if (!cancelled) setMovies([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [movieCritiques, ratedIds]);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    const ro = new ResizeObserver(updateScrollButtons);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      ro.disconnect();
    };
  }, [movies, updateScrollButtons]);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (movies.length === 0) return <p className="text-sm text-muted-foreground">No recommendations yet.</p>;

  return (
    <div className="relative">
      {canScrollLeft && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute -left-3 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full opacity-90 shadow-lg transition-opacity hover:opacity-100"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}

      <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 scroll-smooth" style={{ scrollbarWidth: "none" }}>
        {movies.map((movie) => (
          <div key={movie.id} className="w-[160px] shrink-0 sm:w-[180px]">
            <MovieCard
              movieId={movie.id}
              title={movie.title}
              posterPath={movie.poster_path}
              releaseYear={movie.release_date?.split("-")[0] ?? ""}
              href={`/movie/${movie.id}`}
              mediaType="movie"
              isInWatchlist={isInWatchlist(movie.id, "movie")}
              isRated={ratedIds.has(movie.id)}
              onWatchlistToggle={async () => {
                if (isInWatchlist(movie.id, "movie")) {
                  await removeFromWatchlist(movie.id, "movie");
                  toast.success("Removed from Watchlist");
                } else {
                  await addToWatchlist({
                    mediaId: movie.id,
                    mediaType: "movie",
                    title: movie.title,
                    posterPath: movie.poster_path,
                  });
                  toast.success("Added to Watchlist");
                }
              }}
              onRateClick={() => {
                setSelected(movie);
                setDialogOpen(true);
              }}
            />
          </div>
        ))}
      </div>

      {canScrollRight && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute -right-3 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full opacity-90 shadow-lg transition-opacity hover:opacity-100"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}

      <CritiqueDialog movie={selected} open={dialogOpen} onOpenChange={setDialogOpen} mediaType="movie" />
    </div>
  );
}
