import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { Cairo, Montserrat } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { SiteShell } from "@/components/layout/site-shell";
import { ViewTransitionRejectionHandler } from "@/components/layout/view-transition-rejection-handler";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
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

export async function generateMetadata(): Promise<Metadata> {
  const { branding } = await getPublicSiteContent();
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: branding.defaultMetadataTitle,
      template: `%s | ${branding.siteBrandTitleAr}`,
    },
    description: branding.pwaDescription,
    icons: {
      /** `app/favicon.ico` — يُعرَّف صراحةً حتى لا تستبدله أيقونات PNG فقط في التبويب */
      icon: [
        { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
        { url: branding.icon192, sizes: "192x192", type: "image/png" },
        { url: branding.icon512, sizes: "512x512", type: "image/png" },
      ],
      apple: branding.icon192,
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
  const siteChrome = await getPublicSiteContent();
  const sameAsHrefs = siteChrome.socialLinks.map((s) => s.href);
  const b = siteChrome.branding;

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
        <OrganizationJsonLd
          sameAs={sameAsHrefs}
          organizationName={b.organizationName}
          logoUrl={b.organizationLogoUrl}
          telephone={b.supportPhoneDisplay}
        />
        <ViewTransitions>
          <ViewTransitionRejectionHandler />
          <QueryProvider>
            <ToastProvider />
            <SiteShell
              topAnnouncementBar={siteChrome.topAnnouncementBar}
              socialLinks={siteChrome.socialLinks}
              branding={b}
              searchQuickKeywords={siteChrome.searchQuickKeywords}
            >
              {children}
            </SiteShell>
          </QueryProvider>
        </ViewTransitions>
        {GA_MEASUREMENT_ID ? (
          <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
        ) : null}
      </body>
    </html>
  );
}
