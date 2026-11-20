"use client";

import { useState, useRef, useEffect } from "react";
import type { MediaItem } from "@/lib/cms/types";
import type { ImageFraming } from "@/lib/images/framing";
import { uploadAdminImage } from "@/lib/uploads/client-upload";
import ImageCropModal from "@/components/admin/image-crop-modal";
import FramedRiserImage from "@/components/ui/framed-riser-image";
import { X, Upload, Check, Trash2, Crop } from "lucide-react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  onMediaDeleted?: (url: string) => void;
  /** Current framing metadata for `value` (when used with product photo slots). */
  framing?: ImageFraming | null;
  /** Updates framing metadata on the currently selected `value` without re-uploading. */
  onFramingChange?: (framing: ImageFraming) => void;
  /** Atomic selection callback providing both chosen URL and crop/fit framing metadata. */
  onSelectWithFraming?: (url: string, framing: ImageFraming) => void;
  /** Enable the interactive crop/fit modal before upload and for existing photos. */
  enableCropEditor?: boolean;
}

type PendingCrop =
  | {
      kind: "upload";
      file: File;
      previewUrl: string;
      initialFraming?: ImageFraming | null;
      returnToLibrary?: boolean;
    }
  | {
      kind: "url";
      url: string;
      mediaId?: string;
      initialFraming?: ImageFraming | null;
    };

export default function ImagePicker({
  value,
  onChange,
  label = "Photo",
  onMediaDeleted,
  framing,
  onFramingChange,
  onSelectWithFraming,
  enableCropEditor = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(value);
  const [pendingCrop, setPendingCrop] = useState<PendingCrop | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  function revokePreviewUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  useEffect(() => {
    return () => revokePreviewUrl();
  }, []);

  async function openLibrary() {
    setSelected(value);
    setError("");
    setOpen(true);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = (await res.json().catch(() => ({}))) as { media?: MediaItem[] };
      setMedia(data.media ?? []);
    } catch {
      setError("Failed to load photo library.");
    } finally {
      setLoading(false);
    }
  }

  async function performUpload(file: File, cropFraming?: ImageFraming): Promise<MediaItem | null> {
    setUploading(true);
    setError("");
    try {
      const item = await uploadAdminImage(file, cropFraming);
      setMedia((m) => [item, ...m]);
      setSelected(item.url);
      return item;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function handleFilePicked(file: File, fromLibrary = false) {
    if (!enableCropEditor) {
      const item = await performUpload(file);
      if (item && !fromLibrary) onChange(item.url);
      return;
    }
    revokePreviewUrl();
    const previewUrl = URL.createObjectURL(file);
    objectUrlRef.current = previewUrl;
    setError("");
    setPendingCrop({
      kind: "upload",
      file,
      previewUrl,
      returnToLibrary: fromLibrary,
    });
  }

  async function persistMediaFramingIfKnown(url: string, mediaId: string | undefined, nextFraming: ImageFraming) {
    const targetId = mediaId ?? media.find((m) => m.url === url)?.id;
    if (!targetId) return;
    setMedia((list) =>
      list.map((entry) => (entry.id === targetId ? { ...entry, framing: nextFraming } : entry))
    );
    await fetch(`/api/admin/media?id=${encodeURIComponent(targetId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ framing: nextFraming }),
    }).catch(() => undefined);
  }

  async function handleCropConfirm(nextFraming: ImageFraming) {
    if (!pendingCrop) return;

    if (pendingCrop.kind === "upload") {
      const item = await performUpload(pendingCrop.file, nextFraming);
      if (!item) return;
      revokePreviewUrl();
      const returnToLibrary = pendingCrop.returnToLibrary;
      setPendingCrop(null);
      if (!returnToLibrary) {
        if (onSelectWithFraming) {
          onSelectWithFraming(item.url, nextFraming);
        } else {
          onChange(item.url);
          onFramingChange?.(nextFraming);
        }
      }
      return;
    }

    const { url, mediaId } = pendingCrop;
    setPendingCrop(null);
    if (onSelectWithFraming && url !== value) {
      onSelectWithFraming(url, nextFraming);
    } else if (url === value && onFramingChange) {
      onFramingChange(nextFraming);
    } else if (onSelectWithFraming) {
      onSelectWithFraming(url, nextFraming);
    } else {
      onChange(url);
      onFramingChange?.(nextFraming);
    }
    void persistMediaFramingIfKnown(url, mediaId, nextFraming);
  }

  function handleCropCancel() {
    revokePreviewUrl();
    setPendingCrop(null);
  }

  function confirmSelection() {
    if (!selected) return;
    if (enableCropEditor) {
      const item = media.find((m) => m.url === selected);
      setOpen(false);
      setError("");
      setPendingCrop({
        kind: "url",
        url: selected,
        mediaId: item?.id,
        initialFraming: selected === value && framing ? framing : item?.framing ?? null,
      });
      return;
    }
    onChange(selected);
    setOpen(false);
  }

  function openCropForCurrentValue() {
    if (!value) return;
    const item = media.find((m) => m.url === value);
    setError("");
    setPendingCrop({
      kind: "url",
      url: value,
      mediaId: item?.id,
      initialFraming: framing ?? item?.framing ?? null,
    });
  }

  async function deleteFromLibrary(item: MediaItem) {
    if (!window.confirm("Delete this photo from the library and storage?")) return;
    setDeletingId(item.id);
    setError("");
    try {
      const res = await fetch(`/api/admin/media?id=${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not delete that photo.");
        return;
      }
      setMedia((m) => m.filter((entry) => entry.id !== item.id));
      if (selected === item.url) setSelected("");
      if (value === item.url) onChange("");
      onMediaDeleted?.(item.url);
    } catch {
      setError("Network error while deleting photo.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      {/* Inline preview + trigger */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-widest text-neutral-500 block">{label}</span>
        <div className="flex gap-3 items-start">
          <div
            className={`relative bg-black border border-white/10 overflow-hidden shrink-0 ${
              enableCropEditor ? "w-24 aspect-[3/4] sm:w-28" : "w-24 h-24 sm:w-28 sm:h-28"
            }`}
          >
            {value ? (
              <>
                {enableCropEditor ? (
                  <FramedRiserImage
                    src={value}
                    alt={label}
                    framing={framing}
                    sizes="112px"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={value} alt="" className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setSelected("");
                  }}
                  aria-label={`Remove ${label}`}
                  title={`Remove ${label}`}
                  className="absolute top-1 right-1 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-black/85 text-white border border-white/25 hover:bg-red-600 transition-colors shadow"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            ) : null}
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
                {uploading ? (
                  "Uploading…"
                ) : (
                  <>
                    <Upload className="w-3 h-3" /> Upload new
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const input = e.currentTarget;
                    const file = input.files?.[0];
                    if (file) void handleFilePicked(file, false);
                    input.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => void openLibrary()}
                className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest border border-white/20 px-3 py-2 hover:border-white text-white"
              >
                Choose from library
              </button>
              {value && enableCropEditor && (
                <button
                  type="button"
                  onClick={openCropForCurrentValue}
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest border border-white/25 px-3 py-2 text-neutral-200 hover:text-white hover:border-white transition-colors"
                >
                  <Crop className="w-3 h-3" /> Edit crop
                </button>
              )}
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setSelected("");
                  }}
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest border border-red-500/35 px-3 py-2 text-red-300 hover:bg-red-500/15 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              )}
            </div>
            {value && enableCropEditor && framing && (
              <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                Framing:{" "}
                <span className="text-neutral-200">
                  {framing.mode === "fit"
                    ? "Fit Entire Dress"
                    : `${framing.aspectRatio} Crop${framing.zoom && framing.zoom > 1 ? ` · ${framing.zoom.toFixed(2)}×` : ""}`}
                </span>
              </p>
            )}
            {error && !open && !pendingCrop && (
              <p role="alert" className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 px-2.5 py-1.5">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Photo Library Modal */}
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-[#0e0e12] border border-white/10 w-full max-w-4xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
              <div>
                <h2 className="text-white font-bold text-lg tracking-wider">Photo Library</h2>
                <p className="text-neutral-500 text-xs mt-0.5">
                  Click a photo to select it, then {enableCropEditor ? "preview & adjust framing" : "confirm"}.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest border border-white/20 px-3 py-2 cursor-pointer hover:border-white text-white">
                  {uploading ? (
                    "Uploading…"
                  ) : (
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
                      if (file) void handleFilePicked(file, true);
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
                    const isDeleting = deletingId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`relative aspect-square overflow-hidden border-2 transition-all bg-black ${
                          isSelected ? "border-white" : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelected(item.url)}
                          aria-label={`Select ${item.filename}`}
                          className="w-full h-full block"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.url} alt="" className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-white/15 flex items-center justify-center pointer-events-none">
                              <Check className="w-6 h-6 text-white drop-shadow" />
                            </div>
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={(e) => {
                            e.stopPropagation();
                            void deleteFromLibrary(item);
                          }}
                          aria-label={`Delete ${item.filename} from library`}
                          title="Delete photo from library"
                          className="absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center rounded-full bg-black/85 text-neutral-200 border border-white/20 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
                  onClick={confirmSelection}
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

      {/* Interactive Crop / Positioning / Preview Modal */}
      {pendingCrop && (
        <ImageCropModal
          open
          imageSrc={pendingCrop.kind === "upload" ? pendingCrop.previewUrl : pendingCrop.url}
          label={label}
          confirmLabel={pendingCrop.kind === "upload" ? "Save & Upload" : "Apply Framing"}
          initialFraming={pendingCrop.initialFraming}
          busy={uploading}
          error={error}
          onCancel={handleCropCancel}
          onConfirm={handleCropConfirm}
        />
      )}
    </>
  );
}
