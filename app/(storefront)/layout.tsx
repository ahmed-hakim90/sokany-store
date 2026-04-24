import { SiteShell } from "@/components/layout/site-shell";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { WebSiteJsonLd } from "@/components/seo/WebSiteJsonLd";
import { getPublicSiteContent } from "@/features/cms/services/getPublicSiteContent";

/*
 * واجهة المتجر فقط: هيدر، فوتر، أدراج — بدون تضمين مسار /control.
 */
export default async function StorefrontLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const siteChrome = await getPublicSiteContent();
  const sameAsHrefs = siteChrome.socialLinks.map((s) => s.href);
  const b = siteChrome.branding;

  return (
    <>
      <OrganizationJsonLd
        sameAs={sameAsHrefs}
        organizationName={b.organizationName}
        logoUrl={b.organizationLogoUrl}
        telephone={b.supportPhoneDisplay}
        description={b.pwaDescription}
      />
      <WebSiteJsonLd name={b.siteBrandTitleAr} description={b.pwaDescription} />
      <SiteShell
        topAnnouncementBar={siteChrome.topAnnouncementBar}
        socialLinks={siteChrome.socialLinks}
        branding={b}
        searchQuickKeywords={siteChrome.searchQuickKeywords}
        headerCategoryStrip={siteChrome.headerCategoryStrip}
      >
        {children}
      </SiteShell>
    </>
  );
}
