"use client";

import { useState } from "react";
import { StarIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export default function ReviewForm({ onSubmit, onCancel }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      id: `review-${Date.now()}`,
      author: "You",
      avatar: "https://i.pravatar.cc/80?img=48",
      rating,
      comment: comment.trim() || "Beautiful experience worth sharing.",
      date: new Date().toISOString(),
    });
    setComment("");
    setRating(5);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-primary/10 bg-primary-soft p-4"
    >
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, index) => {
          const starValue = index + 1;

          return (
            <button
              key={starValue}
              type="button"
              onClick={() => setRating(starValue)}
              className={cn(
                "flex size-10 items-center justify-center rounded-full transition",
                starValue <= rating ? "bg-amber-100 text-amber-500" : "bg-white text-slate-300"
              )}
              aria-label={`Rate ${starValue} stars`}
            >
              <StarIcon filled className="size-5" />
            </button>
          );
        })}
      </div>
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={4}
        placeholder="Share what stood out, tips for other travelers, or your favorite moment..."
        className="mt-4 w-full rounded-[22px] border border-black/10 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-primary/30"
      />
      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          className="flex-1 rounded-[20px] bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-strong"
        >
          Submit Review
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[20px] border border-black/8 bg-white px-4 py-3 font-medium text-slate-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
