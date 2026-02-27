"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { searchMulti } from "@/lib/tmdb";
import { toMediaItem, type MediaItem, formatMediaYear } from "@/lib/types";
import { MovieCard } from "@/components/movie-card";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchResults = useCallback(
    async (pageNum: number, append = false) => {
      if (!q.trim()) return;
      setLoading(true);
      try {
        const data = await searchMulti(q.trim(), pageNum);
        const items = data.results
          .map(toMediaItem)
          .filter((r): r is MediaItem => r !== null)
          .sort((a, b) => b.popularity - a.popularity);

        setResults((prev) => (append ? [...prev, ...items] : items));
        setTotalPages(data.total_pages);
      } catch {
        if (!append) setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [q]
  );

  useEffect(() => {
    setPage(1);
    fetchResults(1);
  }, [fetchResults]);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    fetchResults(next, true);
  }

  if (!q.trim()) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Search className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-muted-foreground">Enter a search term to find movies & TV shows</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-6 text-xl font-bold tracking-tight">
        Results for &ldquo;{q}&rdquo;
      </h1>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {results.map((item) => (
            <MovieCard
              key={`${item.mediaType}-${item.id}`}
              movieId={item.id}
              title={item.title}
              posterPath={item.posterPath}
              releaseYear={formatMediaYear(item)}
              href={`/${item.mediaType}/${item.id}`}
              mediaType={item.mediaType}
              onClick={() => {}}
            />
          ))}
        </div>
      ) : (
        !loading && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No results found for &ldquo;{q}&rdquo;
          </p>
        )
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && page < totalPages && results.length > 0 && (
        <div className="flex justify-center py-8">
          <Button variant="outline" onClick={loadMore}>
            Load More
          </Button>
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <main className="mx-auto max-w-5xl animate-in fade-in duration-300 px-4 py-8">
      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <SearchResults />
      </Suspense>
    </main>
  );
}
