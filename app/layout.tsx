import type { Metadata } from "next";
import { Cairo, Montserrat } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { SiteShell } from "@/components/layout/site-shell";
import { ViewTransitionRejectionHandler } from "@/components/layout/view-transition-rejection-handler";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "سوكانى المغربى",
  icons: {
    icon: [
      { url: "/images/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/images/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full min-w-0 flex-col bg-page text-foreground">
        <OrganizationJsonLd />
        <ViewTransitions>
          <ViewTransitionRejectionHandler />
          <QueryProvider>
            <ToastProvider />
            <SiteShell>{children}</SiteShell>
          </QueryProvider>
        </ViewTransitions>
      </body>
    </html>
  );
}
