"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThumbsUp, Minus, ThumbsDown, Loader2 } from "lucide-react";
import type { ReviewSentiment } from "@/lib/types";

const SENTIMENTS: { value: ReviewSentiment; label: string; icon: typeof ThumbsUp; color: string }[] = [
  { value: "positive", label: "Positive", icon: ThumbsUp, color: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10" },
  { value: "neutral", label: "Neutral", icon: Minus, color: "text-zinc-400 border-zinc-400/30 bg-zinc-400/10" },
  { value: "negative", label: "Negative", icon: ThumbsDown, color: "text-red-500 border-red-500/30 bg-red-500/10" },
];

interface ReviewFormProps {
  initialContent?: string;
  initialSentiment?: ReviewSentiment;
  onSubmit: (content: string, sentiment: ReviewSentiment) => Promise<void>;
  onCancel?: () => void;
}

export function ReviewForm({ initialContent = "", initialSentiment, onSubmit, onCancel }: ReviewFormProps) {
  const [content, setContent] = useState(initialContent);
  const [sentiment, setSentiment] = useState<ReviewSentiment | null>(initialSentiment ?? null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = content.trim().length > 0 && sentiment !== null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !sentiment) return;
    setSubmitting(true);
    try {
      await onSubmit(content.trim(), sentiment);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-border/50 p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your review..."
        rows={4}
        className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {SENTIMENTS.map((s) => {
            const Icon = s.icon;
            const active = sentiment === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => setSentiment(s.value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active ? s.color : "border-border/50 text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {s.label}
              </button>
            );
          })}
        </div>

        <span className="text-xs text-muted-foreground tabular-nums">
          {content.length}
        </span>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={!canSubmit || submitting}
          className="bg-amber-500 text-black hover:bg-amber-400"
        >
          {submitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          Post Review
        </Button>
      </div>
    </form>
  );
}
