"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScoreBadge } from "./score-badge";
import { CritiqueDialog } from "./critique-dialog";
import { useAuth } from "./auth-provider";
import { useCritiques } from "@/hooks/use-critiques";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useUninterested } from "@/hooks/use-uninterested";
import { Star, Bookmark, BookmarkCheck, EyeOff, LogIn } from "lucide-react";
import type { TMDBMovie } from "@/lib/types";
import { getErrorMessage } from "@/lib/utils";
import Link from "next/link";

interface MediaActionsProps {
  media: TMDBMovie;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
}

export function MediaActions({ media, mediaType, title, posterPath }: MediaActionsProps) {
  const { user } = useAuth();
  const { getCritique } = useCritiques();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { isUninterested, markUninterested, removeUninterested } = useUninterested();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [score, setScore] = useState<number | undefined>(undefined);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    getCritique(media.id, mediaType).then((c) => {
      if (c) setScore(c.score);
    });
  }, [media.id, mediaType, getCritique]);

  const inWatchlist = isInWatchlist(media.id, mediaType);
  const uninterested = isUninterested(media.id, mediaType);

  if (!user) {
    return (
      <Link href="/auth">
        <Button variant="outline" className="gap-2">
          <LogIn className="h-4 w-4" />
          Sign in to rate & review
        </Button>
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {actionError && (
        <p className="text-sm text-destructive">{actionError}</p>
      )}
      <div className="flex flex-wrap items-center gap-3">
      <Button
        onClick={() => setDialogOpen(true)}
        className="gap-2 bg-amber-500 text-black hover:bg-amber-400"
      >
        <Star className="h-4 w-4" />
        {score !== undefined ? "Update Rating" : "Rate"}
      </Button>

      {score !== undefined && <ScoreBadge score={score} size="lg" />}

      <Button
        variant="outline"
        className="gap-2"
        onClick={async () => {
          setActionError(null);
          try {
            if (inWatchlist) {
              await removeFromWatchlist(media.id, mediaType);
            } else {
              await addToWatchlist({ mediaId: media.id, mediaType, title, posterPath });
            }
          } catch (e) {
            console.error("Watchlist error:", e);
            setActionError(getErrorMessage(e));
          }
        }}
      >
        {inWatchlist ? (
          <BookmarkCheck className="h-4 w-4 text-amber-500" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
        {inWatchlist ? "In Watchlist" : "Watchlist"}
      </Button>

      <Button
        variant="ghost"
        className="gap-2 text-muted-foreground"
        onClick={async () => {
          setActionError(null);
          try {
            if (uninterested) {
              await removeUninterested(media.id, mediaType);
            } else {
              await markUninterested(media.id, mediaType);
            }
          } catch (e) {
            console.error("Uninterested error:", e);
            setActionError(getErrorMessage(e));
          }
        }}
      >
        <EyeOff className="h-4 w-4" />
        {uninterested ? "Undo Uninterested" : "Uninterested"}
      </Button>
      </div>

      <CritiqueDialog
        movie={media}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            getCritique(media.id, mediaType).then((c) => {
              setScore(c?.score);
            });
          }
        }}
        mediaType={mediaType}
      />
    </div>
  );
}
