"use client";

import Image from "next/image";
import Link from "next/link";
import { posterUrl } from "@/lib/tmdb";
import { ScoreBadge } from "./score-badge";
import { Film, Bookmark, Star } from "lucide-react";

interface MovieCardProps {
  movieId: number;
  title: string;
  posterPath: string | null;
  releaseYear: string;
  score?: number;
  onClick?: () => void;
  href?: string;
  mediaType?: "movie" | "tv";
  isInWatchlist?: boolean;
  isRated?: boolean;
  onWatchlistToggle?: () => void;
  onRateClick?: () => void;
}

export function MovieCard({
  title,
  posterPath,
  releaseYear,
  score,
  onClick,
  href,
  isInWatchlist,
  isRated,
  onWatchlistToggle,
  onRateClick,
}: MovieCardProps) {
  const src = posterUrl(posterPath, "w342");

  const content = (
    <>
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
        {src ? (
          <Image
            src={src}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Film className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        {score !== undefined && (
          <div className="absolute top-2 right-2">
            <ScoreBadge score={score} size="sm" />
          </div>
        )}
        {onWatchlistToggle && (
          <button
            type="button"
            aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onWatchlistToggle();
            }}
            className="absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-md bg-black/35 text-white opacity-0 transition-opacity hover:bg-black/50 group-hover:opacity-100"
          >
            <Bookmark className={`h-4.5 w-4.5 ${isInWatchlist ? "fill-current" : ""}`} />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-0.5 p-3">
        <h3 className="line-clamp-1 text-sm font-medium">{title}</h3>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">{releaseYear || "Unknown"}</p>
          {onRateClick && (
            <button
              type="button"
              aria-label={isRated ? "Edit rating" : "Add rating"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRateClick();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-black/35 text-white opacity-0 transition-opacity hover:bg-black/50 group-hover:opacity-100"
            >
              <Star className={`h-4.5 w-4.5 ${isRated ? "fill-current" : ""}`} />
            </button>
          )}
        </div>
      </div>
    </>
  );

  const className =
    "group relative flex flex-col overflow-hidden rounded-lg border border-border/50 bg-card text-left transition-all hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${className} cursor-pointer`}>
      {content}
    </button>
  );
}
