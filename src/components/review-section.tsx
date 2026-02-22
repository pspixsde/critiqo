"use client";

import { useState } from "react";
import { useReviews } from "@/hooks/use-reviews";
import { useAuth } from "./auth-provider";
import { ReviewForm } from "./review-form";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, getErrorMessage } from "@/lib/utils";
import {
  ThumbsUp,
  ThumbsDown,
  Minus,
  MessageSquarePlus,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import type { ReviewFilter, ReviewSort, Review } from "@/lib/types";

const FILTER_OPTIONS: { value: ReviewFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "positive", label: "Positive" },
  { value: "neutral", label: "Neutral" },
  { value: "negative", label: "Negative" },
];

const SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: "rating", label: "Rating" },
  { value: "recent", label: "Recent" },
];

function SentimentBadge({ sentiment }: { sentiment: Review["sentiment"] }) {
  const config = {
    positive: { icon: ThumbsUp, className: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    neutral: { icon: Minus, className: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20" },
    negative: { icon: ThumbsDown, className: "text-red-500 bg-red-500/10 border-red-500/20" },
  }[sentiment];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-1 text-[10px]", config.className)}>
      <Icon className="h-3 w-3" />
      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
    </Badge>
  );
}

interface ReviewSectionProps {
  mediaId: number;
  mediaType: "movie" | "tv";
}

export function ReviewSection({ mediaId, mediaType }: ReviewSectionProps) {
  const { user } = useAuth();
  const {
    reviews,
    userReview,
    loading,
    filter,
    setFilter,
    sort,
    setSort,
    submitReview,
    deleteReview,
    vote,
  } = useReviews(mediaId, mediaType);

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(content: string, sentiment: Review["sentiment"]) {
    setError(null);
    try {
      await submitReview(content, sentiment);
      setShowForm(false);
      setEditMode(false);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  async function handleDelete() {
    setError(null);
    try {
      await deleteReview();
      setEditMode(false);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Reviews</h2>
        {user && !userReview && !showForm && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setShowForm(true)}
          >
            <MessageSquarePlus className="h-4 w-4" />
            Write Review
          </Button>
        )}
      </div>

      {error && (
        <p className="mb-4 text-sm text-destructive">{error}</p>
      )}

      {showForm && !userReview && (
        <div className="mb-6">
          <ReviewForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {userReview && !editMode && (
        <div className="mb-6 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-amber-500">Your Review</span>
              <SentimentBadge sentiment={userReview.sentiment} />
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setEditMode(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {userReview.content}
          </p>
        </div>
      )}

      {editMode && userReview && (
        <div className="mb-6">
          <ReviewForm
            initialContent={userReview.content}
            initialSentiment={userReview.sentiment}
            onSubmit={handleSubmit}
            onCancel={() => setEditMode(false)}
          />
        </div>
      )}

      {/* Filters & Sort */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex rounded-lg border border-border/50 p-0.5">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter(opt.value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                filter === opt.value
                  ? "bg-amber-500/15 text-amber-500"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg border border-border/50 p-0.5 ml-auto">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSort(opt.value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                sort === opt.value
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {filter === "all" ? "No reviews yet. Be the first!" : "No reviews match this filter."}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews
            .filter((r) => r.id !== userReview?.id)
            .map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onVote={vote}
                isOwnReview={false}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function ReviewCard({
  review,
  onVote,
}: {
  review: Review;
  onVote: (reviewId: string, vote: 1 | -1) => Promise<void>;
  isOwnReview: boolean;
}) {
  const timeAgo = formatTimeAgo(review.createdAt);

  return (
    <div className="rounded-lg border border-border/50 p-4">
      <div className="flex items-center gap-3 mb-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-secondary text-xs">
            {review.username[0]?.toUpperCase() ?? "A"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{review.username}</p>
          <p className="text-[11px] text-muted-foreground">{timeAgo}</p>
        </div>
        <SentimentBadge sentiment={review.sentiment} />
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground mb-3">
        {review.content}
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onVote(review.id, 1)}
          className={cn(
            "flex items-center gap-1 text-xs transition-colors",
            review.userVote === 1
              ? "text-amber-500"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          {review.helpfulCount > 0 && review.helpfulCount}
        </button>
        <button
          type="button"
          onClick={() => onVote(review.id, -1)}
          className={cn(
            "flex items-center gap-1 text-xs transition-colors",
            review.userVote === -1
              ? "text-red-500"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
          {review.unhelpfulCount > 0 && review.unhelpfulCount}
        </button>
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
