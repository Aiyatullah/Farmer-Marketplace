import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // unsplash public images
    domains: ["images.unsplash.com"],
    formats: ["image/avif", "image/webp"],
  },
  /* config options here */
};

export default nextConfig;
