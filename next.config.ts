import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.68.50", "localhost:3000", "127.0.0.1:3000"],
  images: {
    // unoptimized removed — Cloudinary handles its own CDN delivery.
    // For local /uploads/ files, Next.js built-in optimizer serves them.
    remotePatterns: [
      {
        // Cloudinary CDN — all delivery subdomains
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
    // Serve AVIF first (smallest), then WebP, then original
    formats: ["image/avif", "image/webp"],
    // Responsive breakpoints matching Tailwind sm/md/lg/xl/2xl
    deviceSizes: [375, 640, 768, 1024, 1280, 1536, 1920],
    // Common thumbnail sizes used in product cards
    imageSizes: [64, 128, 256, 384, 512],
    // Cache optimized images for 30 days
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    optimizeCss: false,
    proxyClientMaxBodySize: "20mb",
  },
};

export default nextConfig;
