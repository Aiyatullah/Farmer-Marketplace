import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // unsplash public images
    domains: ["images.unsplash.com"],
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
  },
  /* config options here */
};

export default nextConfig;
