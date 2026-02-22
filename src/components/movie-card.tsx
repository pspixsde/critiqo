"use client";

import Image from "next/image";
import Link from "next/link";
import { posterUrl } from "@/lib/tmdb";
import { ScoreBadge } from "./score-badge";
import { Badge } from "./ui/badge";
import { Film, Tv } from "lucide-react";

interface MovieCardProps {
  movieId: number;
  title: string;
  posterPath: string | null;
  releaseYear: string;
  score?: number;
  onClick?: () => void;
  href?: string;
  mediaType?: "movie" | "tv";
}

export function MovieCard({
  title,
  posterPath,
  releaseYear,
  score,
  onClick,
  href,
  mediaType,
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
        {mediaType && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-[10px] gap-0.5 px-1.5 py-0.5">
              {mediaType === "tv" ? <Tv className="h-2.5 w-2.5" /> : <Film className="h-2.5 w-2.5" />}
              {mediaType === "tv" ? "TV" : "Movie"}
            </Badge>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-0.5 p-3">
        <h3 className="line-clamp-1 text-sm font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground">{releaseYear || "Unknown"}</p>
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
