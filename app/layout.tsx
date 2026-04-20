import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { Cairo, Montserrat } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { SiteShell } from "@/components/layout/site-shell";
import { ViewTransitionRejectionHandler } from "@/components/layout/view-transition-rejection-handler";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
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
        {CLARITY_PROJECT_ID ? (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");`}
          </Script>
        ) : null}
        <OrganizationJsonLd />
        <ViewTransitions>
          <ViewTransitionRejectionHandler />
          <QueryProvider>
            <ToastProvider />
            <SiteShell>{children}</SiteShell>
          </QueryProvider>
        </ViewTransitions>
        {GA_MEASUREMENT_ID ? (
          <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
        ) : null}
      </body>
    </html>
  );
}
