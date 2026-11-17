"use client";

import { useEffect, useState, useCallback } from "react";
import type { MediaItem } from "@/lib/cms/types";
import { X, Upload, Check } from "lucide-react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImagePicker({ value, onChange, label = "Photo" }: Props) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(value);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/media");
    const data = (await res.json().catch(() => ({}))) as { media?: MediaItem[] };
    setMedia(data.media ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) {
      setSelected(value);
      void fetchMedia();
    }
  }, [open, value, fetchMedia]);

  async function upload(file: File): Promise<string | null> {
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { error?: string; media?: MediaItem };
      if (!res.ok || !data.media?.url) {
        setError(data.error ?? "Upload failed.");
        return null;
      }
      setMedia((m) => [data.media!, ...m]);
      setSelected(data.media.url);
      return data.media.url;
    } catch {
      setError("Network error while uploading photo.");
      return null;
    } finally {
      setUploading(false);
    }
  }

  function confirm() {
    onChange(selected);
    setOpen(false);
  }

  return (
    <>
      {/* Inline preview + trigger */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-widest text-neutral-500 block">{label}</span>
        <div className="flex gap-3 items-start">
          <div className="w-28 h-28 bg-black border border-white/10 overflow-hidden shrink-0">
            {value ? <img src={value} alt="" className="w-full h-full object-cover" /> : null}
          </div>
          <div className="flex-1 space-y-2 min-w-0">
            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Paste URL or use picker →"
              className="w-full bg-black/40 border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-white"
            />
            <div className="flex gap-2 flex-wrap">
              <label className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest border border-white/20 px-3 py-2 cursor-pointer hover:border-white text-white">
                {uploading ? "Uploading…" : (
                  <>
                    <Upload className="w-3 h-3" /> Upload new
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  className="hidden"
                  disabled={uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    const url = await upload(file);
                    if (url) onChange(url);
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest border border-white/20 px-3 py-2 hover:border-white text-white"
              >
                Choose from library
              </button>
            </div>
            {error && !open && <p className="text-xs text-red-400">{error}</p>}
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-[#0e0e12] border border-white/10 w-full max-w-4xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
              <div>
                <h2 className="text-white font-bold text-lg tracking-wider">Photo Library</h2>
                <p className="text-neutral-500 text-xs mt-0.5">Click a photo to select it, then confirm.</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest border border-white/20 px-3 py-2 cursor-pointer hover:border-white text-white">
                  {uploading ? "Uploading…" : (
                    <>
                      <Upload className="w-3 h-3" /> Upload
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void upload(file);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button type="button" onClick={() => setOpen(false)} className="text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
              {loading ? (
                <p className="text-neutral-500 text-sm text-center py-12">Loading…</p>
              ) : media.length === 0 ? (
                <div className="border border-dashed border-white/15 p-12 text-center text-neutral-500 text-sm">
                  No photos yet. Upload the first one above.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {media.map((item) => {
                    const isSelected = selected === item.url;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelected(item.url)}
                        className={`relative aspect-square overflow-hidden border-2 transition-all ${
                          isSelected ? "border-white" : "border-transparent hover:border-white/30"
                        }`}
                      >
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-white/15 flex items-center justify-center">
                            <Check className="w-6 h-6 text-white drop-shadow" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 px-6 py-4 flex items-center justify-between gap-4 shrink-0">
              {selected && (
                <p className="text-xs text-neutral-400 truncate max-w-xs">{selected}</p>
              )}
              <div className="flex gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-widest border border-white/15 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirm}
                  disabled={!selected}
                  className="px-6 py-2 text-xs uppercase tracking-widest bg-white text-black font-bold disabled:opacity-50"
                >
                  Use this photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

