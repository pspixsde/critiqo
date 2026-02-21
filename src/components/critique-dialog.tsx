"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "./star-rating";
import { ScoreBadge } from "./score-badge";
import { posterUrl } from "@/lib/tmdb";
import { useCritiques } from "@/hooks/use-critiques";
import {
  CRITIQUE_DIMENSIONS,
  computeScore,
  getEmptyRatings,
  getGenreNames,
  type TMDBMovie,
  type CritiqueRatings,
  type CritiqueDimension,
} from "@/lib/types";
import { Film, Trash2 } from "lucide-react";

interface CritiqueDialogProps {
  movie: TMDBMovie | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CritiqueDialog({ movie, open, onOpenChange }: CritiqueDialogProps) {
  const { saveCritique, deleteCritique, getCritique } = useCritiques();
  const [ratings, setRatings] = useState<CritiqueRatings>(getEmptyRatings());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (movie && open) {
      const existing = getCritique(movie.id);
      if (existing) {
        setRatings(existing.ratings);
        setIsEditing(true);
      } else {
        setRatings(getEmptyRatings());
        setIsEditing(false);
      }
    }
  }, [movie, open, getCritique]);

  if (!movie) return null;

  const score = computeScore(ratings);
  const allRated = Object.values(ratings).every((v) => v > 0);
  const src = posterUrl(movie.poster_path, "w342");
  const year = movie.release_date ? movie.release_date.split("-")[0] : "";
  const genres = getGenreNames(movie.genre_ids);

  function handleSetRating(dimension: CritiqueDimension, value: number) {
    setRatings((prev) => ({ ...prev, [dimension]: value }));
  }

  function handleSave() {
    if (!allRated || !movie) return;
    const now = new Date().toISOString();
    saveCritique({
      movieId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      releaseYear: year,
      genres,
      ratings,
      score,
      createdAt: isEditing ? getCritique(movie.id)!.createdAt : now,
      updatedAt: now,
    });
    onOpenChange(false);
  }

  function handleDelete() {
    if (!movie) return;
    deleteCritique(movie.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0 overflow-hidden">
        <div className="flex gap-4 p-6 pb-4">
          <div className="relative h-40 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
            {src ? (
              <Image src={src} alt={movie.title} fill className="object-cover" sizes="112px" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Film className="h-8 w-8 text-muted-foreground/30" />
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <DialogHeader className="text-left">
              <DialogTitle className="text-base leading-snug">{movie.title}</DialogTitle>
            </DialogHeader>
            <p className="text-xs text-muted-foreground">{year}</p>
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {genres.slice(0, 3).map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
            {movie.overview && (
              <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                {movie.overview}
              </p>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3 px-6 py-4">
          {CRITIQUE_DIMENSIONS.map((dim) => (
            <StarRating
              key={dim}
              label={dim}
              value={ratings[dim]}
              onChange={(v) => handleSetRating(dim, v)}
            />
          ))}
        </div>

        <Separator />

        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {allRated ? (
              <>
                <span className="text-sm text-muted-foreground">Score:</span>
                <ScoreBadge score={score} size="lg" />
              </>
            ) : (
              <span className="text-sm text-muted-foreground">Rate all dimensions to see your score</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!allRated}
              className="bg-amber-500 text-black hover:bg-amber-400"
            >
              {isEditing ? "Update" : "Save"} Critique
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
