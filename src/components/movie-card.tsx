"use client";

import Image from "next/image";
import { posterUrl } from "@/lib/tmdb";
import { ScoreBadge } from "./score-badge";
import { Film } from "lucide-react";

interface MovieCardProps {
  movieId: number;
  title: string;
  posterPath: string | null;
  releaseYear: string;
  score?: number;
  onClick: () => void;
}

export function MovieCard({ title, posterPath, releaseYear, score, onClick }: MovieCardProps) {
  const src = posterUrl(posterPath, "w342");

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border/50 bg-card text-left transition-all hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer"
    >
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
      </div>
      <div className="flex flex-col gap-0.5 p-3">
        <h3 className="line-clamp-1 text-sm font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground">{releaseYear || "Unknown"}</p>
      </div>
    </button>
  );
}
