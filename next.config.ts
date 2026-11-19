import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.68.50", "localhost:3000", "127.0.0.1:3000"],
  images: {
    // Cloudinary images bypass /_next/image via RiserImage's custom Cloudinary loader.
    // Non-Cloudinary images (/uploads/*, Unsplash fallback CMS) continue optimizing via /_next/image
    // using WebP-only encoding to avoid multi-second cold AVIF CPU stalls on Railway.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.riser.com.bd",
      },
    ],
    // Prefer fast WebP encoding for /_next/image fallbacks instead of slow cold AVIF encoding
    formats: ["image/webp"],
    // Lean responsive breakpoints aligned with Cloudinary eager widths & storefront slots
    deviceSizes: [640, 768, 1024, 1280, 1536, 1920],
    // Compact thumbnail / card sizes (128, 256 for thumbs; 384 for 1x grid cards)
    imageSizes: [128, 256, 384],
    // Cache optimized fallback images for 30 days
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    optimizeCss: false,
    proxyClientMaxBodySize: "20mb",
  },
};

export default nextConfig;
