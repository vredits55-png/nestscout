"use client";

import { useState, useTransition } from "react";
import { Star, MessageSquare, CheckCircle } from "lucide-react";
import { createReview } from "@/actions/reviews";

interface ReviewFormProps {
  propertyId: string;
}

export default function ReviewForm({ propertyId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const handleRatingHover = (value: number) => {
    setHoverRating(value);
  };

  const handleRatingLeave = () => {
    setHoverRating(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating between 1 and 5 stars.");
      return;
    }
    setError("");

    startTransition(async () => {
      const result = await createReview({ propertyId, rating, comment });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      setRating(0);
      setComment("");
    });
  };

  if (success) {
    return (
      <div className="text-center bg-white/40 backdrop-blur-sm border border-white/40 p-10 rounded-[2.5rem] shadow-ambient animate-scale-in">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 animate-breathe">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h4 className="text-2xl font-black font-headline text-on-surface mb-2 tracking-tight">
          Review Submitted!
        </h4>
        <p className="text-on-surface-variant font-medium max-w-sm mx-auto">
          Thank you for sharing your feedback. Your review has been added successfully.
        </p>
      </div>
    );
  }

  return (
    <section className="bg-white/40 backdrop-blur-sm border border-white/40 p-10 rounded-[2.5rem] shadow-ambient">
      <h3 className="text-3xl font-black font-headline text-primary mb-6">
        Share Your Experience
      </h3>
      <p className="text-on-surface-variant font-light mb-8">
        Your rating and review will help others make informed decisions.
      </p>

      {error && (
        <div className="p-4 mb-6 rounded-2xl bg-error/10 border border-error/30 text-error font-bold text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Selector */}
        <div>
          <label className="block text-xs font-bold text-outline-variant uppercase tracking-[0.2em] mb-3">
            Select Rating
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = (hoverRating || rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => handleRatingHover(star)}
                  onMouseLeave={handleRatingLeave}
                  className="p-1 focus:outline-none transition-transform hover:scale-125 duration-200"
                >
                  <Star
                    className={`w-10 h-10 transition-colors duration-200 cursor-pointer ${
                      isActive
                        ? "fill-primary text-primary"
                        : "text-outline-variant fill-none"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Comment field */}
        <div>
          <label className="block text-xs font-bold text-outline-variant uppercase tracking-[0.2em] mb-3">
            Review Comment
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about the space, location, amenities, or landlord interaction..."
            rows={5}
            maxLength={1000}
            className="w-full bg-white/70 border border-[#E2E8F0] p-5 rounded-2xl focus:bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none font-body shadow-inner resize-none text-on-surface placeholder:text-outline-variant"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full btn btn-primary py-4 text-lg rounded-2xl flex justify-center items-center gap-2"
        >
          {isPending ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <MessageSquare className="w-5 h-5" />
              <span>Submit Review</span>
            </>
          )}
        </button>
      </form>
    </section>
  );
}
