"use client";

import { useState, useEffect } from "react";
import { Check, Trash2 } from "lucide-react";
import type { AdminReview } from "@/lib/reviews";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-500 text-xs">
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

export default function ReviewsClient() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/reviews");
    const data = await res.json();
    setReviews(data.reviews ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleApprove(id: string) {
    await fetch(`/api/reviews?id=${id}`, { method: "PATCH" });
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, approved: true } : r));
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  const filtered = reviews.filter((r) => {
    if (filter === "pending") return !r.approved;
    if (filter === "approved") return r.approved;
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.approved).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Reviews</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-amber-600 mt-1">{pendingCount} review{pendingCount !== 1 ? "s" : ""} pending approval</p>
          )}
        </div>
        <div className="flex gap-1 text-xs font-mono uppercase tracking-wider">
          {(["pending", "approved", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 border transition-colors ${
                filter === f
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-2 border-neutral-900 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-neutral-400">
          No {filter === "all" ? "" : filter} reviews.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className={`border rounded-2xl p-4 ${
                r.approved ? "border-neutral-200 bg-white" : "border-amber-200 bg-amber-50/50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <StarDisplay rating={r.rating} />
                    <span className="text-sm font-semibold text-neutral-900">{r.name}</span>
                    <span className="text-xs text-neutral-400">
                      {new Date(r.createdAt).toLocaleDateString("en-GB")}
                    </span>
                    {!r.approved && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-mono">
                        Pending
                      </span>
                    )}
                  </div>
                  {r.productName && (
                    <p className="text-xs text-neutral-500 mt-1">Product: {r.productName}</p>
                  )}
                  {r.comment && (
                    <p className="text-sm text-neutral-700 mt-2 leading-relaxed">{r.comment}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!r.approved && (
                    <button
                      onClick={() => handleApprove(r.id)}
                      className="flex items-center gap-1 text-xs font-mono px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 transition-colors rounded"
                      title="Approve"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
