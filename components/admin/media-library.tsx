"use client";

import { useState } from "react";
import type { MediaItem } from "@/lib/cms/types";

export default function MediaLibrary({ initial }: { initial: MediaItem[] }) {
  const [media, setMedia] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState("");

  async function upload(file: File) {
    setBusy(true);
    setError("");
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/admin/media", { method: "POST", body });
    const data = (await response.json().catch(() => ({}))) as { error?: string; media?: MediaItem };
    setBusy(false);
    if (!response.ok || !data.media) {
      setError(data.error || "Upload failed.");
      return;
    }
    setMedia((current) => [data.media!, ...current]);
  }

  async function remove(id: string) {
    const response = await fetch(`/api/admin/media?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Could not delete that photo.");
      return;
    }
    setMedia((current) => current.filter((item) => item.id !== id));
  }

  async function copy(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Photos</h1>
          <p className="text-neutral-500 text-sm mt-1 max-w-xl">
            Upload a photo here, then use it on Page text. Files are stored on this server and shown on the website immediately after you save the page.
          </p>
        </div>
        <label className="inline-flex items-center justify-center bg-white text-black px-5 py-3 text-xs font-bold tracking-[0.18em] uppercase cursor-pointer">
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
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {media.length === 0 ? (
        <div className="border border-dashed border-white/15 p-12 text-center text-neutral-500 text-sm">
          No photos yet. Upload the first one.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {media.map((item) => (
            <article key={item.id} className="bg-admin-card border border-admin-border">
              <img src={item.url} alt="" className="aspect-[3/4] w-full object-cover" />
              <div className="p-3 space-y-2">
                <p className="text-[10px] text-neutral-500 truncate">{item.url}</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => void copy(item.url)} className="text-xs text-white underline">
                    {copied === item.url ? "Copied" : "Copy link"}
                  </button>
                  <button type="button" onClick={() => void remove(item.id)} className="text-xs text-red-400">
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
