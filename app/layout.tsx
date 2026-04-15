import type { Metadata } from "next";
import { Montserrat, Noto_Sans_Arabic } from "next/font/google";
import { SiteShell } from "@/components/layout/site-shell";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic", "latin"],
  variable: "--font-noto-arabic",
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
      className={`${notoArabic.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-page text-foreground">
        <OrganizationJsonLd />
        <QueryProvider>
          <ToastProvider />
          <SiteShell>{children}</SiteShell>
        </QueryProvider>
      </body>
    </html>
  );
}
