"use client";

import { useState, useCallback, useEffect } from "react";
import Cropper, { type Area, type MediaSize, type Point } from "react-easy-crop";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Crop,
  Monitor,
  Smartphone,
  Heart,
} from "lucide-react";
import FramedRiserImage from "@/components/ui/framed-riser-image";
import {
  getNumericAspectRatio,
  type ImageAspectRatio,
  type ImageDisplayMode,
  type ImageFraming,
} from "@/lib/images/framing";

interface ImageCropModalProps {
  open: boolean;
  imageSrc: string;
  label?: string;
  confirmLabel?: string;
  initialFraming?: ImageFraming | null;
  busy?: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: (framing: ImageFraming) => void | Promise<void>;
}

const ASPECT_OPTIONS: { value: ImageAspectRatio; label: string }[] = [
  { value: "3:4", label: "3:4 Card" },
  { value: "4:5", label: "4:5 Portrait" },
  { value: "original", label: "Original" },
];

export default function ImageCropModal(props: ImageCropModalProps) {
  if (!props.open || !props.imageSrc) return null;
  return <ImageCropDialogContent key={props.imageSrc} {...props} />;
}

function ImageCropDialogContent({
  open,
  imageSrc,
  label = "Product Photo",
  confirmLabel = "Apply Framing",
  initialFraming,
  busy = false,
  error = "",
  onCancel,
  onConfirm,
}: ImageCropModalProps) {
  const [mode, setMode] = useState<ImageDisplayMode>(initialFraming?.mode ?? "crop");
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>(
    initialFraming?.aspectRatio ?? "3:4"
  );
  const [crop, setCrop] = useState<Point>(initialFraming?.crop ?? { x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(initialFraming?.zoom ?? 1);
  const [cropArea, setCropArea] = useState<Area | undefined>(initialFraming?.cropArea);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(
    initialFraming?.naturalWidth && initialFraming?.naturalHeight
      ? { width: initialFraming.naturalWidth, height: initialFraming.naturalHeight }
      : null
  );

  // Close cleanly on Escape when not actively uploading
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, busy, onCancel]);

  const handleMediaLoaded = useCallback((mediaSize: MediaSize) => {
    setNaturalSize({
      width: mediaSize.naturalWidth,
      height: mediaSize.naturalHeight,
    });
  }, []);

  const handleCropAreaChange = useCallback((croppedAreaPercentages: Area) => {
    setCropArea(croppedAreaPercentages);
  }, []);

  const handleReset = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  const numericAspect = getNumericAspectRatio(
    aspectRatio,
    naturalSize?.width,
    naturalSize?.height
  );

  const liveFraming: ImageFraming = {
    mode,
    aspectRatio,
    ...(cropArea ? { cropArea } : {}),
    crop: { x: Math.round(crop.x * 100) / 100, y: Math.round(crop.y * 100) / 100 },
    zoom: Math.round(zoom * 1000) / 1000,
    ...(naturalSize ? { naturalWidth: naturalSize.width, naturalHeight: naturalSize.height } : {}),
  };

  const initialSeedPercentages =
    initialFraming?.mode !== "fit" &&
    initialFraming?.cropArea &&
    initialFraming.aspectRatio === aspectRatio
      ? initialFraming.cropArea
      : undefined;

  return (
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Adjust framing for ${label}`}
    >
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={() => {
          if (!busy) onCancel();
        }}
      />

      <div className="relative bg-[#0e0e13] border border-white/15 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-white/10 shrink-0">
          <div className="min-w-0">
            <h2 className="text-white font-bold text-sm sm:text-base uppercase tracking-wider truncate">
              Adjust Photo Framing — {label}
            </h2>
            <p className="text-neutral-400 text-[11px] mt-0.5">
              Original photo is preserved untouched; crop settings control how product cards frame the dress.
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            aria-label="Close photo framing editor"
            className="text-neutral-400 hover:text-white p-1.5 border border-white/10 hover:border-white/30 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-white/10 bg-black/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="inline-flex border border-white/15 bg-black/60 p-0.5">
            <button
              type="button"
              onClick={() => setMode("crop")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold transition-colors ${
                mode === "crop" ? "bg-white text-black" : "text-neutral-300 hover:text-white"
              }`}
            >
              <Crop className="w-3.5 h-3.5" />
              Crop &amp; Position
            </button>
            <button
              type="button"
              onClick={() => setMode("fit")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold transition-colors ${
                mode === "fit" ? "bg-white text-black" : "text-neutral-300 hover:text-white"
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Fit Entire Dress
            </button>
          </div>

          {naturalSize && (
            <span className="text-[11px] font-mono text-neutral-400">
              Original: {naturalSize.width} × {naturalSize.height} px
            </span>
          )}
        </div>

        {/* Main Workspace + Storefront Previews */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
            {/* Left: Interactive Cropper or Fit View */}
            <div className="space-y-4 min-w-0">
              <div className="relative h-[300px] sm:h-[380px] lg:h-[420px] w-full bg-[#060608] border border-white/15 overflow-hidden">
                {mode === "crop" ? (
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={numericAspect}
                    minZoom={1}
                    maxZoom={3}
                    zoomSpeed={0.15}
                    objectFit="contain"
                    showGrid
                    initialCroppedAreaPercentages={initialSeedPercentages}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropAreaChange={handleCropAreaChange}
                    onCropComplete={handleCropAreaChange}
                    onMediaLoaded={handleMediaLoaded}
                  />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageSrc}
                      alt={label}
                      onLoad={(e) => {
                        const el = e.currentTarget;
                        if (el.naturalWidth > 0 && el.naturalHeight > 0) {
                          setNaturalSize({ width: el.naturalWidth, height: el.naturalHeight });
                        }
                      }}
                      className="max-w-full max-h-full object-contain"
                    />
                    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/85 border border-white/20 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-emerald-300 whitespace-nowrap">
                      Whole photograph shown without cropping
                    </span>
                  </div>
                )}
              </div>

              {mode === "crop" ? (
                <div className="space-y-3 bg-black/30 border border-white/10 p-3.5 sm:p-4">
                  {/* Aspect ratios */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                      Aspect Ratio
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ASPECT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setAspectRatio(opt.value)}
                          className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border transition-colors ${
                            aspectRatio === opt.value
                              ? "bg-white text-black border-white font-bold"
                              : "bg-black/40 text-neutral-300 border-white/15 hover:border-white/40"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Zoom + Center */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 shrink-0">
                      Zoom ({zoom.toFixed(2)}×)
                    </span>
                    <div className="flex items-center gap-2 flex-1 min-w-[160px]">
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.max(1, Number((z - 0.1).toFixed(2))))}
                        aria-label="Zoom out"
                        className="w-7 h-7 flex items-center justify-center border border-white/15 text-neutral-300 hover:text-white hover:border-white"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="range"
                        aria-label="Zoom level"
                        min={1}
                        max={3}
                        step={0.01}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="flex-1 accent-white cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))}
                        aria-label="Zoom in"
                        className="w-7 h-7 flex items-center justify-center border border-white/15 text-neutral-300 hover:text-white hover:border-white"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider border border-white/20 text-neutral-200 hover:text-white hover:border-white transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" /> Center
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/25 px-4 py-3 text-xs text-emerald-200 flex items-center justify-between gap-3">
                  <span>
                    <strong>Fit Entire Dress</strong> displays 100% of this photo inside the 3:4
                    storefront card with zero edge cropping—ideal for wide shots or full flared gowns.
                  </span>
                </div>
              )}
            </div>

            {/* Right: Accurate Desktop & Mobile Storefront Previews */}
            <div className="bg-[#09090d] border border-white/10 p-4 space-y-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-400 font-bold">
                  Live Storefront Frame Preview
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Updates live using the exact 3:4 storefront card renderer.
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap lg:flex-col xl:flex-row gap-4 justify-center items-start">
                {/* Desktop Card Preview */}
                <div className="space-y-1.5 shrink-0">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    <Monitor className="w-3 h-3" /> Desktop Card (3:4)
                  </div>
                  <div className="w-[152px] bg-[#0a0a0d] border border-white/15 overflow-hidden">
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-950">
                      <FramedRiserImage
                        src={imageSrc}
                        alt={`${label} desktop preview`}
                        framing={liveFraming}
                        containerAspect={3 / 4}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                      <div className="absolute top-2 left-2 right-2 flex items-start justify-between pointer-events-none">
                        <span className="px-1.5 py-0.5 text-[7px] font-mono tracking-wider uppercase font-bold bg-brand-600 text-white">
                          LIMITED DROP
                        </span>
                        <span className="w-5 h-5 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/80">
                          <Heart className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 space-y-1 border-t border-white/10">
                      <div className="h-2.5 w-4/5 bg-white/25 rounded-sm" />
                      <p className="text-[10px] font-mono text-white font-semibold">৳1,490</p>
                    </div>
                  </div>
                </div>

                {/* Mobile 2-Column Card Preview */}
                <div className="space-y-1.5 shrink-0">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    <Smartphone className="w-3 h-3" /> Mobile 2-Col (3:4)
                  </div>
                  <div className="w-[128px] bg-[#0a0a0d] border border-white/15 overflow-hidden">
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-950">
                      <FramedRiserImage
                        src={imageSrc}
                        alt={`${label} mobile preview`}
                        framing={liveFraming}
                        containerAspect={3 / 4}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                      <div className="absolute top-1.5 left-1.5 right-1.5 flex items-start justify-between pointer-events-none">
                        <span className="px-1 py-0.5 text-[6px] font-mono uppercase font-bold bg-brand-600 text-white">
                          NEW
                        </span>
                        <span className="w-4 h-4 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/80">
                          <Heart className="w-2 h-2" />
                        </span>
                      </div>
                    </div>
                    <div className="p-2 space-y-1 border-t border-white/10">
                      <div className="h-2 w-3/4 bg-white/25 rounded-sm" />
                      <p className="text-[9px] font-mono text-white font-semibold">৳1,490</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 text-xs text-red-300 bg-red-500/10 border border-red-500/30 px-3 py-2"
            >
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-end gap-3 shrink-0 bg-[#0b0b10]">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="px-4 py-2 text-xs uppercase tracking-widest border border-white/15 text-neutral-300 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onConfirm(liveFraming)}
            className="px-5 py-2 text-xs uppercase tracking-widest bg-white text-black font-bold hover:bg-neutral-200 transition-colors disabled:opacity-60"
          >
            {busy ? "Uploading…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
