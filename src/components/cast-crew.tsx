import Image from "next/image";
import { profileUrl } from "@/lib/tmdb";
import { User } from "lucide-react";
import type { TMDBCredits } from "@/lib/types";
import { HorizontalScroll } from "./horizontal-scroll";

const CREW_JOBS = [
  "Producer",
  "Executive Producer",
  "Writer",
  "Screenplay",
  "Original Music Composer",
  "Director of Photography",
] as const;

const JOB_LABELS: Record<string, string> = {
  Director: "Director",
  Producer: "Producer",
  "Executive Producer": "Producer",
  Writer: "Writer",
  Screenplay: "Writer",
  "Original Music Composer": "Composer",
  "Director of Photography": "Cinematographer",
};

interface CastCrewProps {
  credits: TMDBCredits;
}

export function CastCrew({ credits }: CastCrewProps) {
  const topCast = credits.cast.slice(0, 15);
  const directors = credits.crew.filter((c) => c.job === "Director");
  const filteredCrew = credits.crew.filter((c) =>
    (CREW_JOBS as readonly string[]).includes(c.job)
  );

  const uniqueCrew = new Map<string, { name: string; role: string; profilePath: string | null }>();
  for (const c of filteredCrew) {
    const key = `${c.id}-${JOB_LABELS[c.job] ?? c.job}`;
    if (!uniqueCrew.has(key)) {
      uniqueCrew.set(key, {
        name: c.name,
        role: JOB_LABELS[c.job] ?? c.job,
        profilePath: c.profile_path,
      });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {topCast.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Cast</h2>
          <HorizontalScroll className="flex gap-3 overflow-x-auto pb-2">
            {topCast.map((member) => {
              const src = profileUrl(member.profile_path, "w185");
              return (
                <div
                  key={`${member.id}-${member.character}`}
                  className="flex w-[120px] shrink-0 flex-col items-center gap-2"
                >
                  <div className="relative h-28 w-28 overflow-hidden rounded-full bg-muted">
                    {src ? (
                      <Image
                        src={src}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium leading-tight">{member.name}</p>
                    <p className="text-[11px] leading-tight text-muted-foreground">
                      {member.character}
                    </p>
                  </div>
                </div>
              );
            })}
          </HorizontalScroll>
        </div>
      )}

      {directors.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Director{directors.length > 1 ? "s" : ""}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {directors.map((director) => {
              const src = profileUrl(director.profile_path, "w185");
              return (
                <div key={director.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                    {src ? (
                      <Image src={src} alt={director.name} fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{director.name}</p>
                    <p className="text-xs text-muted-foreground">Director</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {uniqueCrew.size > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Crew</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from(uniqueCrew.values()).map((member, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                  {member.profilePath ? (
                    <Image
                      src={profileUrl(member.profilePath, "w185")!}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
