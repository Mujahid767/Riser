"use client";

import { useState } from "react";
import { Tag, X, Check } from "lucide-react";

interface CouponInputProps {
  subtotal: number;
  onApply: (discount: number, code: string) => void;
  onRemove: () => void;
  applied?: { code: string; discount: number } | null;
}

export default function CouponInput({
  subtotal,
  onApply,
  onRemove,
  applied,
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleApply() {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid coupon code.");
      } else {
        onApply(data.discount, data.code);
        setCode("");
        setError("");
      }
    } catch {
      setError("Failed to validate. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between bg-green-950/30 border border-green-500/30 px-4 py-3 rounded">
        <div className="flex items-center gap-2 text-green-400 text-xs font-mono">
          <Check className="w-4 h-4" />
          <span>
            Coupon <strong>{applied.code}</strong> applied — ৳{applied.discount.toLocaleString()} off
          </span>
        </div>
        <button
          onClick={onRemove}
          className="text-neutral-400 hover:text-white transition-colors"
          aria-label="Remove coupon"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="COUPON CODE"
            maxLength={30}
            className="w-full bg-black/40 border border-white/15 pl-8 pr-3 py-2.5 text-xs font-mono uppercase tracking-widest text-white placeholder-neutral-600 focus:outline-none focus:border-white/40 transition-colors"
          />
        </div>
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="px-4 py-2.5 text-xs font-mono uppercase tracking-widest border border-white/20 text-white/80 hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? "..." : "Apply"}
        </button>
      </div>
      {error && (
        <p className="text-xs font-mono text-red-400">{error}</p>
      )}
    </div>
  );
}
