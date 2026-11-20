"use client";

import { useState, useEffect, useRef } from "react";
import type { MediaItem } from "@/lib/cms/types";
import type { ImageFraming } from "@/lib/images/framing";
import { uploadAdminImage } from "@/lib/uploads/client-upload";
import ImageCropModal from "@/components/admin/image-crop-modal";
import FramedRiserImage from "@/components/ui/framed-riser-image";
import { Upload, Cloud, HardDrive, AlertTriangle, Check, Trash2, Crop } from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type PendingLibraryCrop =
  | { kind: "upload"; file: File; previewUrl: string }
  | { kind: "existing"; item: MediaItem };

export default function MediaLibrary({ initial }: { initial: MediaItem[] }) {
  const [media, setMedia] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState("");
  const [storage, setStorage] = useState<"cloudinary" | "local" | null>(null);
  const [pendingCrop, setPendingCrop] = useState<PendingLibraryCrop | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  function revokePreview() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }

  useEffect(() => {
    fetch("/api/admin/storage-info")
      .then((r) => r.json())
      .then((d: { storage?: "cloudinary" | "local" }) => setStorage(d.storage ?? "local"))
      .catch(() => setStorage("local"));
    return () => revokePreview();
  }, []);

  function startUploadWithPreview(file: File) {
    revokePreview();
    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;
    setError("");
    setPendingCrop({ kind: "upload", file, previewUrl });
  }

  async function handleConfirmCrop(framing: ImageFraming) {
    if (!pendingCrop) return;
    setBusy(true);
    setError("");
    try {
      if (pendingCrop.kind === "upload") {
        const item = await uploadAdminImage(pendingCrop.file, framing);
        setMedia((m) => [item, ...m]);
        revokePreview();
        setPendingCrop(null);
      } else {
        const res = await fetch(`/api/admin/media?id=${encodeURIComponent(pendingCrop.item.id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ framing }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string; media?: MediaItem };
        if (!res.ok || !data.media) {
          setError(data.error ?? "Could not update framing.");
          return;
        }
        setMedia((m) => m.map((entry) => (entry.id === data.media!.id ? data.media! : entry)));
        setPendingCrop(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this photo? It will be removed from storage.")) return;
    setError("");
    const response = await fetch(`/api/admin/media?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not delete that photo.");
      return;
    }
    setMedia((m) => m.filter((item) => item.id !== id));
  }

  async function copy(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(""), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Photos</h1>
          <p className="text-neutral-500 text-sm mt-1 max-w-xl">
            Upload product and banner photos with live crop &amp; fit preview. Originals stay intact in storage.
          </p>
        </div>
        <label className="inline-flex items-center justify-center gap-2 bg-white text-black px-5 py-3 text-xs font-bold tracking-[0.18em] uppercase cursor-pointer hover:bg-neutral-100 transition-colors">
          {busy ? (
            "Uploading…"
          ) : (
            <>
              <Upload className="w-4 h-4" /> Upload photo
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) startUploadWithPreview(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {/* Storage status banner */}
      {storage === "cloudinary" ? (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
          <Cloud className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm text-emerald-300 font-semibold">Cloudinary CDN active</p>
            <p className="text-xs text-emerald-400/70 mt-0.5">
              Photos are stored on Cloudinary&apos;s global CDN. Customers get images served from the
              nearest server worldwide — ultra-fast loading.
            </p>
          </div>
        </div>
      ) : storage === "local" ? (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm text-amber-300 font-semibold">Using local server storage</p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              Photos are saved to this server&apos;s disk. This works fine for a VPS. To get CDN speed,
              add your Cloudinary keys to <code className="font-mono bg-black/30 px-1">.env.local</code> and restart the server.
            </p>
            <p className="text-xs text-amber-400/70 mt-1">
              <strong>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</strong>, <strong>CLOUDINARY_API_KEY</strong>,{" "}
              <strong>CLOUDINARY_API_SECRET</strong>
            </p>
          </div>
        </div>
      ) : null}

      {error && !pendingCrop && <p className="text-sm text-red-400">{error}</p>}

      {/* Grid */}
      {media.length === 0 ? (
        <div className="border border-dashed border-white/15 p-16 text-center">
          <Upload className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">No photos yet. Upload the first one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {media.map((item) => (
            <article key={item.id} className="bg-admin-card border border-admin-border group relative overflow-hidden">
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-black">
                <FramedRiserImage
                  src={item.url}
                  alt=""
                  framing={item.framing}
                  sizes="(max-width: 768px) 50vw, 25vw"
                  hoverScale
                />
              </div>

              {/* Storage badge */}
              <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
                {item.storage === "cloudinary" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/80 text-white px-1.5 py-0.5 backdrop-blur-sm">
                    <Cloud className="w-2.5 h-2.5" /> CDN
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 backdrop-blur-sm">
                    <HardDrive className="w-2.5 h-2.5" /> Local
                  </span>
                )}
                {item.framing && (
                  <span className="text-[9px] font-mono uppercase bg-black/80 text-neutral-200 border border-white/15 px-1.5 py-0.5">
                    {item.framing.mode === "fit" ? "Fit Dress" : `${item.framing.aspectRatio}`}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <p className="text-[10px] text-neutral-500 truncate">{item.filename}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-neutral-600">
                    {item.width}×{item.height} · {formatBytes(item.bytes)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void copy(item.url)}
                    className="text-xs text-white hover:text-neutral-300 flex items-center gap-1 transition-colors"
                  >
                    {copied === item.url ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      "Copy link"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setPendingCrop({ kind: "existing", item });
                    }}
                    className="text-xs text-neutral-300 hover:text-white transition-colors flex items-center gap-1"
                    title="Edit default crop framing"
                  >
                    <Crop className="w-3 h-3" /> Crop
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(item.id)}
                    aria-label={`Delete ${item.filename}`}
                    className="text-xs text-neutral-500 hover:text-red-400 transition-colors flex items-center gap-1 ml-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {media.length > 0 && (
        <p className="text-xs text-neutral-600 text-center">
          {media.length} photo{media.length !== 1 ? "s" : ""} ·{" "}
          {storage === "cloudinary" ? "Served from Cloudinary CDN" : "Served from local disk"}
        </p>
      )}

      {pendingCrop && (
        <ImageCropModal
          open
          imageSrc={
            pendingCrop.kind === "upload" ? pendingCrop.previewUrl : pendingCrop.item.url
          }
          label={
            pendingCrop.kind === "upload"
              ? pendingCrop.file.name
              : pendingCrop.item.filename
          }
          confirmLabel={pendingCrop.kind === "upload" ? "Save & Upload" : "Save Framing"}
          initialFraming={
            pendingCrop.kind === "existing" ? pendingCrop.item.framing ?? null : null
          }
          busy={busy}
          error={error}
          onCancel={() => {
            revokePreview();
            setPendingCrop(null);
          }}
          onConfirm={handleConfirmCrop}
        />
      )}
    </div>
  );
}
