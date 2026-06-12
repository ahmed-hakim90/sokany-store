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

function frameAncestorsPolicy(): string {
  const raw = process.env.ALLOWED_FRAME_ANCESTORS?.trim();
  if (raw) return raw;

  const sources = new Set(["'self'"]);
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) {
    try {
      const u = new URL(site);
      sources.add(u.origin);
    } catch {
      /* keep the safe default */
    }
  }
  return Array.from(sources).join(" ");
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      `frame-ancestors ${frameAncestorsPolicy()}`,
      "object-src 'none'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com https://www.google.com https://www.recaptcha.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://sokany-eg.com https://www.sokany-eg.com https://firebasestorage.googleapis.com https://storage.googleapis.com https://img.freepik.com https://www.google-analytics.com https://www.googletagmanager.com",
      "font-src 'self' data:",
      "connect-src 'self' https://sokany-eg.com https://www.sokany-eg.com https://firestore.googleapis.com https://firebasestorage.googleapis.com https://firebaseinstallations.googleapis.com https://fcmregistrations.googleapis.com https://www.googleapis.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.google-analytics.com https://www.googletagmanager.com https://*.fawrystaging.com https://*.fawry.com https://atfawry.com https://accept.paymob.com",
      "frame-src 'self' https://accept.paymob.com https://*.paymob.com https://atfawry.com https://*.fawrystaging.com https://www.google.com https://www.recaptcha.net https://*.firebaseapp.com https://*.web.app",
      "media-src 'self' blob: https://firebasestorage.googleapis.com https://storage.googleapis.com",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=(self)",
      "usb=()",
      "bluetooth=()",
      "accelerometer=()",
      "gyroscope=()",
      "magnetometer=()",
    ].join(", "),
  },
];

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
    qualities: [70, 74, 75],
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
        headers: securityHeaders,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
