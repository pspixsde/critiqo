"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  readonly?: boolean;
}

export function StarRating({ label, value, onChange, readonly = false }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="w-20 text-sm font-medium capitalize text-muted-foreground">{label}</span>
      <div
        className="flex gap-0.5"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= (hovered || value);
          return (
            <button
              key={star}
              type="button"
              disabled={readonly}
              onClick={() => onChange(star)}
              onMouseEnter={() => !readonly && setHovered(star)}
              className={cn(
                "p-0.5 transition-transform",
                !readonly && "hover:scale-110 cursor-pointer",
                readonly && "cursor-default"
              )}
            >
              <Star
                className={cn(
                  "h-5 w-5 transition-colors",
                  active ? "fill-amber-400 text-amber-400" : "fill-none text-muted-foreground/40"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
