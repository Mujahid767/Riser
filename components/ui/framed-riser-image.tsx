"use client";

import RiserImage from "@/components/ui/riser-image";
import { cn } from "@/lib/utils";
import {
  computeFramedCropLayout,
  resolveFramingSizes,
  type ImageFraming,
} from "@/lib/images/framing";

export interface FramedRiserImageProps {
  src: string;
  alt: string;
  framing?: ImageFraming | null;
  /** Target box ratio (`width / height`), defaults to 3:4 storefront product cards. */
  containerAspect?: number;
  /** When true, ignores saved crop and shows the full original uncropped photograph cleanly. */
  forceFit?: boolean;
  sizes?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  preload?: boolean;
  hoverScale?: boolean;
  /** Applied to the outer `inset-0` wrapper (useful for hover cross-fade opacity). */
  outerClassName?: string;
  /** Applied to the underlying `<img>`. */
  imgClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function FramedRiserImage({
  src,
  alt,
  framing,
  containerAspect = 3 / 4,
  forceFit = false,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  loading,
  fetchPriority,
  preload,
  hoverScale = false,
  outerClassName,
  imgClassName,
  onLoad,
  onError,
}: FramedRiserImageProps) {
  const layout = forceFit
    ? { mode: "fit" as const }
    : computeFramedCropLayout(framing, containerAspect);

  const effectiveSizes = resolveFramingSizes(sizes, layout);
  const isLocalPreview = src.startsWith("blob:") || src.startsWith("data:");

  function renderImg(fitClass: string) {
    if (isLocalPreview) {
      return (
        // Local object-URL / data-URI previews inside the admin crop editor
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onLoad={onLoad}
          onError={onError}
          className={cn("absolute inset-0 w-full h-full", fitClass, imgClassName)}
        />
      );
    }

    return (
      <RiserImage
        src={src}
        alt={alt}
        fill
        preload={preload}
        loading={loading}
        fetchPriority={fetchPriority}
        sizes={effectiveSizes}
        onLoad={onLoad}
        onError={onError}
        className={cn(fitClass, imgClassName)}
      />
    );
  }

  if (layout.mode === "fit") {
    return (
      <div
        className={cn(
          "absolute inset-0 overflow-hidden bg-[#0a0a0e]",
          outerClassName
        )}
      >
        <div
          className={cn(
            "relative w-full h-full",
            hoverScale && "transition-transform duration-700 ease-out group-hover:scale-105"
          )}
        >
          {renderImg("object-contain object-center")}
        </div>
      </div>
    );
  }

  if (layout.mode === "crop") {
    return (
      <div className={cn("absolute inset-0 overflow-hidden", outerClassName)}>
        <div
          className={cn(
            "relative w-full h-full",
            hoverScale && "transition-transform duration-700 ease-out group-hover:scale-105"
          )}
        >
          <div style={layout.wrapperStyle}>{renderImg("object-cover object-center")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("absolute inset-0 overflow-hidden", outerClassName)}>
      <div
        className={cn(
          "relative w-full h-full",
          hoverScale && "transition-transform duration-700 ease-out group-hover:scale-105"
        )}
      >
        {renderImg("object-cover object-center")}
      </div>
    </div>
  );
}
