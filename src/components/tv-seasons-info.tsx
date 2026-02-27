"use client";

import { useState } from "react";
import { getTVSeasonDetails } from "@/lib/tmdb";
import type { TMDBTVDetails, TMDBSeasonDetails } from "@/lib/types";
import { ChevronDown, Loader2 } from "lucide-react";

interface TVSeasonsInfoProps {
  tvId: number;
  seasons: TMDBTVDetails["seasons"];
}

export function TVSeasonsInfo({ tvId, seasons }: TVSeasonsInfoProps) {
  const [openSeason, setOpenSeason] = useState<number | null>(null);
  const [cache, setCache] = useState<Record<number, TMDBSeasonDetails>>({});
  const [loadingSeason, setLoadingSeason] = useState<number | null>(null);

  async function toggleSeason(seasonNumber: number) {
    if (openSeason === seasonNumber) {
      setOpenSeason(null);
      return;
    }
    setOpenSeason(seasonNumber);
    if (cache[seasonNumber]) return;
    setLoadingSeason(seasonNumber);
    try {
      const data = await getTVSeasonDetails(tvId, seasonNumber);
      setCache((prev) => ({ ...prev, [seasonNumber]: data }));
    } finally {
      setLoadingSeason(null);
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Seasons & Episodes</h2>
      <div className="flex flex-col gap-3">
        {seasons
          .filter((s) => s.season_number > 0)
          .map((season) => {
            const isOpen = openSeason === season.season_number;
            const details = cache[season.season_number];
            return (
              <div key={season.id} className="rounded-lg border border-border/50">
                <button
                  type="button"
                  onClick={() => toggleSeason(season.season_number)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                >
                  <div>
                    <p className="text-sm font-medium">{season.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {season.episode_count} episodes
                      {season.air_date ? ` · First aired ${season.air_date}` : ""}
                    </p>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="border-t border-border/50 px-4 py-3">
                    {loadingSeason === season.season_number && (
                      <div className="flex justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {!loadingSeason && details && (
                      <div className="flex flex-col gap-2">
                        {details.episodes.map((ep) => (
                          <div key={ep.id} className="flex items-center justify-between gap-3 text-sm">
                            <span className="truncate">
                              E{ep.episode_number}: {ep.name}
                            </span>
                            <span className="shrink-0 text-xs text-muted-foreground">{ep.air_date ?? "TBA"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
