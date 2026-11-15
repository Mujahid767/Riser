"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import type { PublicReview } from "@/lib/reviews";

interface ReviewSectionProps {
  productId: string;
}

function StarRating({
  value,
  onChange,
  size = 20,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            width={size}
            height={size}
            className={
              display >= star
                ? "fill-yellow-400 text-yellow-400"
                : "text-neutral-300"
            }
          />
        </button>
      ))}
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  return `${Math.floor(months / 12)} year${Math.floor(months / 12) > 1 ? "s" : ""} ago`;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [rating, setRating] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formRating, setFormRating] = useState(5);
  const [formName, setFormName] = useState("");
  const [formComment, setFormComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews ?? []);
        setRating(data.rating ?? { average: 0, count: 0 });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Please enter your name.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating: formRating,
          comment: formComment,
          name: formName,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error ?? "Failed to submit. Try again.");
      } else {
        setSubmitted(true);
        setShowForm(false);
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-12 pt-8 border-t border-neutral-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Customer Reviews
          </h2>
          {rating.count > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating value={Math.round(rating.average)} size={16} />
              <span className="text-sm text-neutral-600">
                {rating.average} out of 5 ({rating.count} review{rating.count !== 1 ? "s" : ""})
              </span>
            </div>
          )}
        </div>
        {!submitted && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-xs font-mono uppercase tracking-widest text-brand-600 hover:text-brand-700 border border-brand-200 hover:border-brand-400 px-4 py-2 transition-colors"
          >
            {showForm ? "Cancel" : "Write a Review"}
          </button>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 mb-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-2">
              Your Rating
            </label>
            <StarRating value={formRating} onChange={setFormRating} size={24} />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              maxLength={80}
              placeholder="e.g. Fatema R."
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
              Review (optional)
            </label>
            <textarea
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Share your experience with this piece..."
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400 transition-colors resize-none"
            />
          </div>
          {formError && (
            <p className="text-xs text-red-500">{formError}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="btn-luxury text-xs py-2.5 px-6 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-sm text-green-800">
          Thank you! Your review will appear after approval.
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse h-20 bg-neutral-100 rounded-2xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-8">
          No reviews yet. Be the first to share your experience!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border border-neutral-100 rounded-2xl p-4 bg-neutral-50/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating value={review.rating} size={14} />
                    <span className="text-xs font-semibold text-neutral-900">
                      {review.name}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-neutral-700 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
                <span className="text-xs text-neutral-400 whitespace-nowrap shrink-0">
                  {timeAgo(review.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
