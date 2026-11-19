"use client";

import { useState } from "react";
import { uploadAdminImage } from "@/lib/uploads/client-upload";
import { X } from "lucide-react";

export default function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      const item = await uploadAdminImage(file);
      onChange(item.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <span className="text-[10px] uppercase tracking-widest text-neutral-500">{label}</span>
      <div className="flex gap-3 items-start">
        <div className="relative w-28 h-28 bg-black border border-white/10 overflow-hidden shrink-0">
          {value ? (
            <>
              <img src={value} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onChange("")}
                aria-label={`Remove ${label}`}
                className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-black/85 text-white border border-white/25 hover:bg-red-600 transition-colors shadow"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : null}
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="w-full bg-black/40 border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-white"
          />
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex items-center text-[10px] uppercase tracking-widest border border-white/20 px-3 py-2 cursor-pointer hover:border-white text-white">
              {busy ? "Uploading…" : "Upload photo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                className="hidden"
                disabled={busy}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void upload(file);
                  event.target.value = "";
                }}
              />
            </label>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest border border-red-500/35 px-3 py-2 text-red-300 hover:bg-red-500/15 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
