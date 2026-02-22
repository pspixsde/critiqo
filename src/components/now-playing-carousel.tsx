"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getNowPlayingMovies } from "@/lib/tmdb";
import { MovieCard } from "./movie-card";
import { useUninterested } from "@/hooks/use-uninterested";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { TMDBMovie } from "@/lib/types";

export function NowPlayingCarousel() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const { isUninterested } = useUninterested();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    getNowPlayingMovies()
      .then((data) => setMovies(data.results))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, []);

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

  const filtered = movies.filter((m) => !isUninterested(m.id, "movie"));

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (filtered.length === 0) return null;

  return (
    <div className="relative group">
      {canScrollLeft && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute -left-3 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {filtered.map((movie) => (
          <div key={movie.id} className="w-[160px] shrink-0 sm:w-[180px]">
            <MovieCard
              movieId={movie.id}
              title={movie.title}
              posterPath={movie.poster_path}
              releaseYear={movie.release_date?.split("-")[0] ?? ""}
              href={`/movie/${movie.id}`}
              onClick={() => {}}
            />
          </div>
        ))}
      </div>

      {canScrollRight && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute -right-3 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
