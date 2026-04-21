import Link from "next/link";
import { LegalPageShell } from "@/components/layout/legal-page-shell";
import { fetchSokanyWpPage } from "@/lib/sokany-official-wp";
import { OFFICIAL_SOKANY_SITE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

type OfficialWpPageContentProps = {
  slug: string;
  /** Override H1 when WP title is English but we want Arabic SEO label. */
  heading?: string;
};

/*
 * صفحات قانونية/ثابتة (شروط، إرجاع، خصوصية…): محتوى HTML من ووردبريس الموقع الرسمي.
 *
 * — خلفية: `bg-page` + تدرج خفيف؛ داخل `LegalPageShell` بطاقة بيضاء بزوايا editorial وحدود وظل.
 * — الجسم: `prose` (Typography) + `dir="rtl"`؛ جدول/خرائط داخل حاوية `overflow-x-auto` لتجنب السكرول الأفقي للصفحة.
 * — الاستجابة: حشو البطاقة `p-5 sm:p-8 md:p-10`؛ نص المقال `prose-sm sm:prose-base`.
 */
export async function OfficialWpPageContent({ slug, heading }: OfficialWpPageContentProps) {
  const page = await fetchSokanyWpPage(slug);
  const title = heading ?? page?.title ?? "المحتوى";

  if (!page?.html) {
    return (
      <LegalPageShell>
        <h1 className="font-display text-2xl font-bold text-brand-950 md:text-3xl">{title}</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          تعذّر تحميل المحتوى من الموقع الرسمي مؤقتاً. يمكنك{" "}
          <a
            href={`${OFFICIAL_SOKANY_SITE_URL}/${slug}/`}
            className="font-medium text-brand-800 underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            فتح الصفحة على الموقع الرسمي
          </a>
          .
        </p>
      </LegalPageShell>
    );
  }

  return (
    <LegalPageShell>
      <header className="mb-6 border-b border-border/80 pb-6 sm:mb-8">
        <h1 className="font-display text-2xl font-bold text-brand-950 md:text-3xl">{title}</h1>
      </header>

      <div className="min-w-0 overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <article
          dir="rtl"
          lang="ar"
          className={cn(
            "legal-wp-prose official-wp-content",
            "prose prose-sm sm:prose-base prose-neutral max-w-none text-pretty",
            "prose-headings:font-display prose-headings:text-brand-950",
            "prose-p:text-brand-950 prose-li:marker:text-brand-700",
            "prose-a:text-brand-800 prose-a:font-medium prose-a:no-underline hover:prose-a:underline",
            "prose-strong:text-brand-950",
            "prose-img:mx-auto prose-img:max-w-full prose-img:rounded-xl prose-img:shadow-sm",
          )}
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
      </div>

      <p className="mt-8 border-t border-border/80 pt-6 text-center text-xs text-muted-foreground sm:mt-10">
        المصدر:{" "}
        <a
          href={`${OFFICIAL_SOKANY_SITE_URL}/${slug}/`}
          className="font-medium text-brand-800 underline-offset-2 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {OFFICIAL_SOKANY_SITE_URL.replace(/^https:\/\//, "")}
        </a>
        {" — "}
        <Link href="/" className="font-medium text-brand-800 underline-offset-2 hover:underline">
          العودة للمتجر
        </Link>
      </p>
    </LegalPageShell>
  );
}
