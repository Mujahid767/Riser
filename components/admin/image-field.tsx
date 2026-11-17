"use client";

import { useState } from "react";
import { uploadAdminImage } from "@/lib/uploads/client-upload";

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
        <div className="w-28 h-28 bg-black border border-white/10 overflow-hidden shrink-0">
          {value ? <img src={value} alt="" className="w-full h-full object-cover" /> : null}
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="w-full bg-black/40 border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-white"
          />
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
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
