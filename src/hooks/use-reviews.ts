"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";
import type { Review, ReviewFilter, ReviewSort, ReviewSentiment } from "@/lib/types";

export function useReviews(mediaId: number, mediaType: "movie" | "tv") {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [sort, setSort] = useState<ReviewSort>("rating");
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();

      const { data: reviewRows, error: reviewError } = await supabase
        .from("reviews")
        .select("*, profiles(username, display_name, avatar_url)")
        .eq("media_id", mediaId)
        .eq("media_type", mediaType);

      if (reviewError) {
        console.error("Failed to load reviews:", reviewError);
        setLoading(false);
        return;
      }

      if (cancelled || !reviewRows) {
        setLoading(false);
        return;
      }

      const rows = reviewRows as Record<string, unknown>[];
      const reviewIds = rows.map((r) => r.id as string);

      const votesMap: Record<string, { helpful: number; unhelpful: number; userVote: 1 | -1 | null }> = {};

      if (reviewIds.length > 0) {
        const { data: voteRows } = await supabase
          .from("review_votes")
          .select("review_id, user_id, vote")
          .in("review_id", reviewIds);

        if (!cancelled && voteRows) {
          for (const v of voteRows as { review_id: string; user_id: string; vote: number }[]) {
            if (!votesMap[v.review_id]) votesMap[v.review_id] = { helpful: 0, unhelpful: 0, userVote: null };
            if (v.vote === 1) votesMap[v.review_id].helpful++;
            else votesMap[v.review_id].unhelpful++;
            if (user && v.user_id === user.id) {
              votesMap[v.review_id].userVote = v.vote as 1 | -1;
            }
          }
        }
      }

      if (!cancelled) {
        const mapped: Review[] = rows.map((r) => {
          const profile = r.profiles as { username: string; display_name?: string; avatar_url: string | null } | null;
          const votes = votesMap[r.id as string] ?? { helpful: 0, unhelpful: 0, userVote: null };
          return {
            id: r.id as string,
            userId: r.user_id as string,
            username: profile?.display_name ?? profile?.username ?? "Anonymous",
            avatarUrl: profile?.avatar_url ?? null,
            mediaId: r.media_id as number,
            mediaType: r.media_type as "movie" | "tv",
            content: r.content as string,
            sentiment: r.sentiment as ReviewSentiment,
            helpfulCount: votes.helpful,
            unhelpfulCount: votes.unhelpful,
            userVote: votes.userVote,
            createdAt: r.created_at as string,
            updatedAt: r.updated_at as string,
          };
        });
        setReviews(mapped);
        setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [mediaId, mediaType, user, version]);

  const userReview = user ? reviews.find((r) => r.userId === user.id) ?? null : null;

  const filteredAndSorted = reviews
    .filter((r) => filter === "all" || r.sentiment === filter)
    .sort((a, b) => {
      if (sort === "recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      const totalA = a.helpfulCount + a.unhelpfulCount;
      const totalB = b.helpfulCount + b.unhelpfulCount;
      const ratioA = totalA > 0 ? a.helpfulCount / totalA : 0;
      const ratioB = totalB > 0 ? b.helpfulCount / totalB : 0;
      if (ratioB !== ratioA) return ratioB - ratioA;
      return totalB - totalA;
    });

  const submitReview = useCallback(
    async (content: string, sentiment: ReviewSentiment) => {
      if (!user) return;
      const supabase = createClient();
      const { error } = await supabase.from("reviews").upsert(
        {
          user_id: user.id,
          media_id: mediaId,
          media_type: mediaType,
          content,
          sentiment,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,media_id,media_type" }
      );
      if (error) {
        console.error("Failed to submit review:", error);
        throw error;
      }
      setVersion((v) => v + 1);
    },
    [user, mediaId, mediaType]
  );

  const deleteReview = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("user_id", user.id)
      .eq("media_id", mediaId)
      .eq("media_type", mediaType);
    if (error) {
      console.error("Failed to delete review:", error);
      throw error;
    }
    setVersion((v) => v + 1);
  }, [user, mediaId, mediaType]);

  const vote = useCallback(
    async (reviewId: string, voteValue: 1 | -1) => {
      if (!user) return;
      const supabase = createClient();
      const existing = reviews.find((r) => r.id === reviewId);
      if (existing?.userVote === voteValue) {
        const { error } = await supabase
          .from("review_votes")
          .delete()
          .eq("review_id", reviewId)
          .eq("user_id", user.id);
        if (error) {
          console.error("Failed to remove vote:", error);
          throw error;
        }
      } else {
        const { error } = await supabase.from("review_votes").upsert(
          {
            review_id: reviewId,
            user_id: user.id,
            vote: voteValue,
          },
          { onConflict: "review_id,user_id" }
        );
        if (error) {
          console.error("Failed to vote:", error);
          throw error;
        }
      }
      setVersion((v) => v + 1);
    },
    [user, reviews]
  );

  return {
    reviews: filteredAndSorted,
    userReview,
    loading,
    filter,
    setFilter,
    sort,
    setSort,
    submitReview,
    deleteReview,
    vote,
  };
}
