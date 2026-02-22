"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Film, Tv } from "lucide-react";
import { searchMulti } from "@/lib/tmdb";
import { posterUrl } from "@/lib/tmdb";
import { toMediaItem, type MediaItem } from "@/lib/types";

export function SearchWidget() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        const data = await searchMulti(trimmed);
        if (!controller.signal.aborted) {
          const items = data.results
            .map(toMediaItem)
            .filter((r): r is MediaItem => r !== null)
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 6);
          setResults(items);
          setOpen(true);
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

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setOpen(false);
    if (e.key === "Enter" && query.trim().length >= 2) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search movies & TV shows..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-9 h-11"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-lg border border-border/50 bg-popover shadow-xl">
          <div className="max-h-[400px] overflow-y-auto">
            {results.map((item) => {
              const src = posterUrl(item.posterPath, "w92");
              const year = item.releaseDate?.split("-")[0] ?? "";
              const href = `/${item.mediaType}/${item.id}`;

              return (
                <Link
                  key={`${item.mediaType}-${item.id}`}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent"
                >
                  <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-muted">
                    {src ? (
                      <Image src={src} alt={item.title} fill className="object-cover" sizes="40px" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Film className="h-4 w-4 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{year}</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="shrink-0 text-[10px] gap-1"
                  >
                    {item.mediaType === "movie" ? (
                      <Film className="h-3 w-3" />
                    ) : (
                      <Tv className="h-3 w-3" />
                    )}
                    {item.mediaType === "movie" ? "Movie" : "TV"}
                  </Badge>
                </Link>
              );
            })}
          </div>
          {query.trim().length >= 2 && (
            <Link
              href={`/search?q=${encodeURIComponent(query.trim())}`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center border-t border-border/50 py-2.5 text-sm font-medium text-amber-500 transition-colors hover:bg-accent"
            >
              Show All Results
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
