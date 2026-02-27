"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { profileUrl, getMovieCredits, getTVCredits } from "@/lib/tmdb";
import type { Critique } from "@/lib/types";

interface TopPeopleCarouselProps {
  critiques: Critique[];
}

type Mode = "actors" | "directors";
type SortMode = "count" | "rating";

interface PersonStats {
  id: number;
  name: string;
  profilePath: string | null;
  titleCount: number;
  totalScore: number;
}

export function TopPeopleCarousel({ critiques }: TopPeopleCarouselProps) {
  const [mode, setMode] = useState<Mode>("actors");
  const [sortMode, setSortMode] = useState<SortMode>("count");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [actors, setActors] = useState<PersonStats[]>([]);
  const [directors, setDirectors] = useState<PersonStats[]>([]);
  const cacheRef = useRef<Map<string, { cast: Array<{ id: number; name: string; profile_path: string | null; order: number }>; crew: Array<{ id: number; name: string; profile_path: string | null; job: string }> }>>(new Map());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (critiques.length === 0) {
        setActors([]);
        setDirectors([]);
        setLoading(false);
        setProgress({ done: 0, total: 0 });
        return;
      }
      setLoading(true);
      setProgress({ done: 0, total: critiques.length });

      const actorMap = new Map<number, PersonStats>();
      const directorMap = new Map<number, PersonStats>();

      for (let i = 0; i < critiques.length; i += 1) {
        const critique = critiques[i];
        const cacheKey = `${critique.mediaType}-${critique.movieId}`;
        let credits = cacheRef.current.get(cacheKey);

        if (!credits) {
          try {
            credits =
              critique.mediaType === "tv"
                ? await getTVCredits(critique.movieId)
                : await getMovieCredits(critique.movieId);
            cacheRef.current.set(cacheKey, credits);
          } catch {
            credits = { cast: [], crew: [] };
          }
        }

        credits.cast
          .filter((person) => person.order <= 4)
          .forEach((person) => {
            const existing = actorMap.get(person.id);
            if (existing) {
              existing.titleCount += 1;
              existing.totalScore += critique.score;
            } else {
              actorMap.set(person.id, {
                id: person.id,
                name: person.name,
                profilePath: person.profile_path,
                titleCount: 1,
                totalScore: critique.score,
              });
            }
          });

        credits.crew
          .filter((person) => person.job === "Director")
          .forEach((person) => {
            const existing = directorMap.get(person.id);
            if (existing) {
              existing.titleCount += 1;
              existing.totalScore += critique.score;
            } else {
              directorMap.set(person.id, {
                id: person.id,
                name: person.name,
                profilePath: person.profile_path,
                titleCount: 1,
                totalScore: critique.score,
              });
            }
          });

        if (!cancelled) setProgress({ done: i + 1, total: critiques.length });
      }

      if (!cancelled) {
        setActors(Array.from(actorMap.values()).filter((person) => person.titleCount >= 5));
        setDirectors(Array.from(directorMap.values()).filter((person) => person.titleCount >= 5));
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [critiques]);

  const visiblePeople = useMemo(() => {
    const source = mode === "actors" ? actors : directors;
    return [...source].sort((a, b) => {
      if (sortMode === "rating") {
        const aAvg = a.totalScore / a.titleCount;
        const bAvg = b.totalScore / b.titleCount;
        if (bAvg !== aAvg) return bAvg - aAvg;
      }
      return b.titleCount - a.titleCount;
    });
  }, [actors, directors, mode, sortMode]);

  return (
    <div className="rounded-lg border border-border/50 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Top Rated People</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={mode === "actors" ? "default" : "outline"}
            className={mode === "actors" ? "bg-amber-500 text-black hover:bg-amber-400" : ""}
            onClick={() => setMode("actors")}
          >
            Actors
          </Button>
          <Button size="sm" variant={mode === "directors" ? "default" : "outline"} onClick={() => setMode("directors")}>
            Directors
          </Button>
          <Button size="sm" variant={sortMode === "count" ? "default" : "outline"} onClick={() => setSortMode("count")}>
            Most Rated
          </Button>
          <Button size="sm" variant={sortMode === "rating" ? "default" : "outline"} onClick={() => setSortMode("rating")}>
            Highest Rating
          </Button>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground">
          Loading credits... {progress.done}/{progress.total}
        </p>
      )}

      {!loading && visiblePeople.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No {mode} meet the 5-title minimum yet.
        </p>
      )}

      {!loading && visiblePeople.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {visiblePeople.map((person) => {
            const avg = Math.round(person.totalScore / person.titleCount);
            const src = profileUrl(person.profilePath, "w185");
            return (
              <div key={person.id} className="w-36 shrink-0 rounded-md border border-border/50 p-2">
                <div className="relative mb-2 aspect-[2/3] w-full overflow-hidden rounded bg-muted">
                  {src ? (
                    <Image src={src} alt={person.name} fill className="object-cover" sizes="144px" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <p className="line-clamp-1 text-sm font-medium">{person.name}</p>
                <p className="text-xs text-muted-foreground">{person.titleCount} titles rated</p>
                <p className="text-xs text-muted-foreground">Avg: {avg}/100</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
