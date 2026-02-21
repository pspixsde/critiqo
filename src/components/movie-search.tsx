"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { searchMovies } from "@/lib/tmdb";
import { MovieCard } from "./movie-card";
import { CritiqueDialog } from "./critique-dialog";
import { useCritiques } from "@/hooks/use-critiques";
import type { TMDBMovie } from "@/lib/types";

export function MovieSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { getCritique } = useCritiques();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        const data = await searchMovies(trimmed);
        if (!controller.signal.aborted) {
          setResults(data.results);
        }
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  function handleMovieClick(movie: TMDBMovie) {
    setSelectedMovie(movie);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search for a movie..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 h-11"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {results.map((movie) => {
            const critique = getCritique(movie.id);
            return (
              <MovieCard
                key={movie.id}
                movieId={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                releaseYear={movie.release_date ? movie.release_date.split("-")[0] : ""}
                score={critique?.score}
                onClick={() => handleMovieClick(movie)}
              />
            );
          })}
        </div>
      )}

      {query.trim().length >= 2 && !loading && results.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No movies found for &ldquo;{query.trim()}&rdquo;
        </p>
      )}

      <CritiqueDialog
        movie={selectedMovie}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
