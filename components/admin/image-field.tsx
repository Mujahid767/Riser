"use client";

import { useState } from "react";

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
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/admin/media", { method: "POST", body });
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      media?: { url: string };
    };
    setBusy(false);
    if (!response.ok || !data.media?.url) {
      setError(data.error || "Upload failed.");
      return;
    }
    onChange(data.media.url);
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
