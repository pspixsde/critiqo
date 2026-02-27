"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScoreBadge } from "./score-badge";
import { CritiqueDialog } from "./critique-dialog";
import { useAuth } from "./auth-provider";
import { useCritiques } from "@/hooks/use-critiques";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useUninterested } from "@/hooks/use-uninterested";
import { useCustomLists } from "@/hooks/use-custom-lists";
import { Star, Bookmark, BookmarkCheck, EyeOff, LogIn, ListPlus, Check } from "lucide-react";
import type { TMDBMovie } from "@/lib/types";
import { getErrorMessage } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

interface MediaActionsProps {
  media: TMDBMovie;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
}

export function MediaActions({ media, mediaType, title, posterPath }: MediaActionsProps) {
  const { user, loading } = useAuth();
  const { getCritique } = useCritiques();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { isUninterested, markUninterested, removeUninterested } = useUninterested();
  const { lists, createList, getListsContainingMedia, addToList, removeFromList } = useCustomLists();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [score, setScore] = useState<number | undefined>(undefined);
  const [actionError, setActionError] = useState<string | null>(null);
  const [listMenuOpen, setListMenuOpen] = useState(false);
  const [activeListIds, setActiveListIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getCritique(media.id, mediaType).then((c) => {
      if (c) setScore(c.score);
    });
  }, [media.id, mediaType, getCritique]);

  useEffect(() => {
    if (!listMenuOpen || !user) return;
    getListsContainingMedia(media.id, mediaType)
      .then((ids) => setActiveListIds(ids))
      .catch((error) => setActionError(getErrorMessage(error)));
  }, [listMenuOpen, user, media.id, mediaType, getListsContainingMedia]);

  const inWatchlist = isInWatchlist(media.id, mediaType);
  const uninterested = isUninterested(media.id, mediaType);

  if (loading) {
    return <div className="h-10 w-44 animate-pulse rounded-md bg-muted" />;
  }

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
              toast.success("Removed from Watchlist");
            } else {
              await addToWatchlist({ mediaId: media.id, mediaType, title, posterPath });
              toast.success("Added to Watchlist");
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

      <div className="relative">
        <Button variant="outline" className="gap-2" onClick={() => setListMenuOpen((v) => !v)}>
          <ListPlus className="h-4 w-4" />
          Add to List
        </Button>
        {listMenuOpen && (
          <div className="absolute left-0 top-full z-20 mt-2 w-60 rounded-md border border-border/50 bg-popover p-2 shadow-xl">
            <div className="max-h-56 overflow-auto">
              {lists.map((list) => {
                const inList = activeListIds.has(list.id);
                return (
                  <button
                    type="button"
                    key={list.id}
                    className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                    onClick={async () => {
                      try {
                        if (inList) {
                          await removeFromList(list.id, media.id, mediaType);
                          const next = new Set(activeListIds);
                          next.delete(list.id);
                          setActiveListIds(next);
                          toast.success(`Removed from ${list.name}`);
                        } else {
                          await addToList(list.id, {
                            mediaId: media.id,
                            mediaType,
                            title,
                            posterPath,
                          });
                          const next = new Set(activeListIds);
                          next.add(list.id);
                          setActiveListIds(next);
                          toast.success(`Added to ${list.name}`);
                        }
                      } catch (error) {
                        setActionError(getErrorMessage(error));
                      }
                    }}
                  >
                    <span className="truncate">{list.name}</span>
                    {inList && <Check className="h-4 w-4 text-amber-500" />}
                  </button>
                );
              })}
              {lists.length === 0 && (
                <p className="px-2 py-2 text-xs text-muted-foreground">No custom lists yet</p>
              )}
            </div>
            <div className="mt-2 border-t border-border/50 pt-2">
              <button
                type="button"
                className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-amber-500 hover:bg-accent"
                onClick={async () => {
                  const name = window.prompt("Enter list name");
                  if (!name) return;
                  try {
                    await createList(name);
                    toast.success("List created");
                  } catch (error) {
                    setActionError(getErrorMessage(error));
                  }
                }}
              >
                + Create New List
              </button>
            </div>
          </div>
        )}
      </div>

      <Button
        variant={uninterested ? "outline" : "ghost"}
        className={
          uninterested
            ? "gap-2 border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
            : "gap-2 text-muted-foreground"
        }
        onClick={async () => {
          setActionError(null);
          try {
            if (uninterested) {
              await removeUninterested(media.id, mediaType);
              toast.success("Removed from Uninterested");
            } else {
              await markUninterested(media.id, mediaType, title, posterPath);
              toast.success("Marked as Uninterested");
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
