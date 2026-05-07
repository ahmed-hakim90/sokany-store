import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

function siteImagePatterns(): NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
> {
  const patterns: NonNullable<
    NonNullable<NextConfig["images"]>["remotePatterns"]
  > = [];
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      const u = new URL(raw);
      patterns.push({
        protocol: u.protocol === "https:" ? "https" : "http",
        hostname: u.hostname,
        ...(u.port ? { port: u.port } : {}),
        pathname: "/**",
      });
    } catch {
      /* ignore invalid URL */
    }
  }
  patterns.push(
    { protocol: "http", hostname: "localhost", pathname: "/**" },
    { protocol: "http", hostname: "127.0.0.1", pathname: "/**" },
    { protocol: "https", hostname: "firebasestorage.googleapis.com", pathname: "/**" },
    { protocol: "https", hostname: "storage.googleapis.com", pathname: "/**" },
  );
  return patterns;
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/sw.js", destination: "/api/pwa-sw" }];
  },
  async redirects() {
    return [
      {
        source: "/order-tracking",
        destination: "/track-order",
        permanent: true,
      },
      {
        source: "/service-centers",
        destination: "/branches",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sokany-eg.com",
        pathname: "/wp-content/**",
      },
      {
        protocol: "https",
        hostname: "www.sokany-eg.com",
        pathname: "/wp-content/**",
      },
      {
        protocol: "https",
        hostname: "img.freepik.com",
        pathname: "/**",
      },
      ...siteImagePatterns(),
    ],
  },
  async headers() {
    return [
      {
        source: "/images/hero/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
