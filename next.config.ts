import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  customWorkerSrc: "sw.js",
  workboxOptions: {
    // Define runtime caching strategies
    runtimeCaching: [
      {
        // Cache API requests with Stale-While-Revalidate
        urlPattern: /^https:\/\/.*\.(?:json|js|css)$/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-resources",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
          },
        },
      },
      {
        // Cache Supabase API calls with NetworkFirst
        urlPattern: /^https:\/\/.*\.supabase\..*\/rest\/.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "supabase-api",
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 5, // 5 minutes
          },
        },
      },
      {
        // Cache images with CacheFirst
        urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|webp|gif)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "images",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  webpack: config => {
    return config;
  },
  turbopack: {},
};

export default withPWA(nextConfig);
