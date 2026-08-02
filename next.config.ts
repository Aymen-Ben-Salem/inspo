import type { NextConfig } from "next";

const remoteImageHostnames = [
  "images.unsplash.com",
  "res.cloudinary.com",
  process.env.MEDIA_HOSTNAME,
].filter((hostname): hostname is string => Boolean(hostname));

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 31,
    remotePatterns: remoteImageHostnames.map((hostname) => ({ protocol: "https", hostname })),
  },
  typedRoutes: true,
};

export default nextConfig;
