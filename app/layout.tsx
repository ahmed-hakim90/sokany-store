import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { cache } from "react";
import { headers } from "next/headers";
import Script from "next/script";
import { Cairo, Montserrat } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { ViewTransitionRejectionHandler } from "@/components/layout/view-transition-rejection-handler";
import { getPublicSiteContent } from "@/features/cms/services/getPublicSiteContent";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { CLARITY_PROJECT_ID, GA_MEASUREMENT_ID } from "@/lib/constants";
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

/** يطابق أصل الصفحة (localhost في التطوير) حتى تُحل `/favicon.ico` ومسارات الأيقونات النسبية بشكل صحيح — وليس دوماً نطاق `NEXT_PUBLIC_SITE_URL`. */
async function requestMetadataBase(): Promise<URL> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host?.trim()) {
    return new URL(getSiteUrl());
  }
  const forwardedProto = h.get("x-forwarded-proto");
  const proto =
    forwardedProto?.replace(/:$/, "") ||
    (process.env.NODE_ENV === "development" ? "http" : "https");
  return new URL(`${proto}://${host}`);
}

const getCachedBranding = cache(async () => {
  const { branding } = await getPublicSiteContent();
  return branding;
});

export async function generateViewport(): Promise<Viewport> {
  const branding = await getCachedBranding();
  return {
    /** شريط النظام/المتصفح (Chrome أندرويد وغيره) — يلتزم بـ `branding.themeColor` من الـ CMS */
    themeColor: branding.themeColor,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getCachedBranding();
  const metadataBase = await requestMetadataBase();
  const googleVerification =
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

  return {
    metadataBase,
    title: {
      default: branding.defaultMetadataTitle,
      template: `%s | ${branding.siteBrandTitleAr}`,
    },
    description: branding.pwaDescription,
    ...(googleVerification
      ? { verification: { google: googleVerification } }
      : {}),
    icons: {
      /** أيقونة التبويب — `app/favicon.ico` (ICO حقيقي مُولَّد من شعار الموقع). */
      icon: [
        { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
        { url: branding.icon192, sizes: "192x192", type: "image/png" },
        { url: branding.icon512, sizes: "512x512", type: "image/png" },
      ],
      apple: branding.appleTouchIcon,
    },
    openGraph: {
      title: branding.defaultMetadataTitle,
      description: branding.pwaDescription,
      siteName: branding.siteBrandTitleAr,
      locale: "ar_EG",
      type: "website",
      images: [
        {
          url: branding.defaultOgImageUrl,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: branding.defaultMetadataTitle,
      description: branding.pwaDescription,
      images: [branding.defaultOgImageUrl],
    },
  };
}

export default async function RootLayout({
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
        {CLARITY_PROJECT_ID ? (
          <Script id="microsoft-clarity" strategy="lazyOnload">
            {`(function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");`}
          </Script>
        ) : null}
        <ViewTransitions>
          <ViewTransitionRejectionHandler />
          <QueryProvider>
            <ToastProvider />
            {children}
          </QueryProvider>
        </ViewTransitions>
        {GA_MEASUREMENT_ID ? (
          <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
        ) : null}
        <SpeedInsights />
      </body>
    </html>
  );
}
