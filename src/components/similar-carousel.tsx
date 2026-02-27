"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getMovieSimilar } from "@/lib/tmdb";
import { MovieCard } from "./movie-card";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useCritiques } from "@/hooks/use-critiques";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { CritiqueDialog } from "./critique-dialog";
import type { TMDBMovie } from "@/lib/types";
import { toast } from "sonner";

export function SimilarCarousel() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { critiques } = useCritiques();
  const [selected, setSelected] = useState<TMDBMovie | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [referenceTitle, setReferenceTitle] = useState<string>("");
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
        const source = movieCritiques.find((c) => c.score >= 80);
        if (!source) {
          if (!cancelled) {
            setReferenceTitle("");
            setMovies([]);
          }
          return;
        }

        const data = await getMovieSimilar(source.movieId);
        const sorted = [...data.results].sort((a, b) => {
          const aRated = ratedIds.has(a.id) ? 1 : 0;
          const bRated = ratedIds.has(b.id) ? 1 : 0;
          return aRated - bRated;
        });

        if (!cancelled) {
          setReferenceTitle(source.title);
          setMovies(sorted.slice(0, 30));
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

  if (!referenceTitle || movies.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Similar to {referenceTitle}</h2>
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
    </div>
  );
}
