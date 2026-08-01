import type { NextConfig } from "next";

const remoteImageHostnames = ["images.unsplash.com", process.env.MEDIA_HOSTNAME].filter(
  (hostname): hostname is string => Boolean(hostname),
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: remoteImageHostnames.map((hostname) => ({ protocol: "https", hostname })),
  },
  typedRoutes: true,
};

export default nextConfig;
