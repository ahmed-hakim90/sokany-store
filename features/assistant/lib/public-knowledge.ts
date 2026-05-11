import "server-only";

import { unstable_cache } from "next/cache";
import { getCategoriesServer } from "@/features/categories/services/getCategoriesServer";
import { getPublicSiteContent } from "@/features/cms/services/getPublicSiteContent";
import { getProductsListServer } from "@/features/products/services/getProductsServer";
import { aboutContent } from "@/features/about/content";
import { fetchSokanyWpPage } from "@/lib/sokany-official-wp";
import { ROUTES, SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { stripHtml } from "@/lib/utils";
import type { PublicKnowledgeChunk, PublicKnowledgeKind } from "@/features/assistant/types";

const PRODUCT_KNOWLEDGE_LIMIT = 80;
const MAX_CHUNK_TEXT_LENGTH = 1200;

const ALLOWED_PUBLIC_URL_PREFIXES = [
  "/",
  "/products",
  "/categories",
  "/offers",
  "/search",
  "/about",
  "/contact",
  "/branches",
  "/retailers",
  "/privacy",
  "/terms",
  "/returns",
  "/warranty",
] as const;

function compactText(...parts: Array<string | number | null | undefined | false>): string {
  return parts
    .map((part) => (part == null || part === false ? "" : String(part)))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_CHUNK_TEXT_LENGTH);
}

function publicUrl(url: string): string {
  const normalized = url.startsWith("/") ? url : "/";
  if (
    ALLOWED_PUBLIC_URL_PREFIXES.some(
      (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`) || normalized.startsWith(`${prefix}?`),
    )
  ) {
    return normalized;
  }
  return "/";
}

function chunk(
  id: string,
  kind: PublicKnowledgeKind,
  title: string,
  url: string,
  text: string,
): PublicKnowledgeChunk | null {
  const cleanTitle = compactText(title);
  const cleanText = compactText(text);
  if (!cleanTitle || !cleanText) return null;
  return {
    id,
    kind,
    title: cleanTitle,
    url: publicUrl(url),
    text: cleanText,
  };
}

function addChunk(
  chunks: PublicKnowledgeChunk[],
  id: string,
  kind: PublicKnowledgeKind,
  title: string,
  url: string,
  text: string,
) {
  const next = chunk(id, kind, title, url, text);
  if (next) chunks.push(next);
}

function flattenAboutContent(): string {
  return compactText(
    aboutContent.hero.headline,
    aboutContent.trust.title,
    aboutContent.trust.body,
    ...aboutContent.trust.tiles.flatMap((tile) => [tile.title, tile.description]),
    aboutContent.darkMedia.title,
    aboutContent.darkMedia.subtitle,
    aboutContent.value.title,
    aboutContent.value.body,
    ...aboutContent.value.tiles.flatMap((tile) => [tile.title, tile.description]),
    aboutContent.vision.title,
    ...aboutContent.vision.paragraphs,
    aboutContent.afterSales.title,
    aboutContent.afterSales.intro,
    ...aboutContent.afterSales.rows.flatMap((row) => [row.title, row.body]),
    aboutContent.quote.text,
  );
}

async function collectPublicKnowledgeUncached(): Promise<PublicKnowledgeChunk[]> {
  const chunks: PublicKnowledgeChunk[] = [];
  const [siteContent, productsResult, categories, termsPage, warrantyPage] =
    await Promise.all([
      getPublicSiteContent(),
      getProductsListServer({
        page: 1,
        per_page: PRODUCT_KNOWLEDGE_LIMIT,
        orderby: "popularity",
        order: "desc",
      }),
      getCategoriesServer({ per_page: 100 }),
      fetchSokanyWpPage("terms-and-conditions"),
      fetchSokanyWpPage("warranty-and-maintenance", {
        internalPostBasePath: ROUTES.WARRANTY,
      }),
    ]);

  addChunk(
    chunks,
    "page-home",
    "page",
    "الصفحة الرئيسية",
    ROUTES.HOME,
    compactText(
      SITE_BRAND_TITLE_AR,
      siteContent.branding.siteBrandTitleAr,
      siteContent.branding.pwaDescription,
      siteContent.promoFlash.headline,
      siteContent.promoFlash.subline,
      siteContent.topAnnouncementBar.items.map((item) => item.text).join(" "),
      siteContent.searchQuickKeywords.join(" "),
    ),
  );

  addChunk(chunks, "page-about", "page", "عن سوكاني", ROUTES.ABOUT, flattenAboutContent());

  addChunk(
    chunks,
    "policy-returns",
    "policy",
    "سياسة الاسترجاع والاستبدال",
    ROUTES.RETURNS_POLICY,
    "يمكن إرجاع المنتج خلال 14 يوم من تاريخ الشراء بشرط أن يكون في حالته الأصلية وغير مستخدم، مع تقديم الفاتورة أو إثبات الشراء. للتواصل بخصوص الاسترجاع استخدم البريد info@sokanyelmaghraby.com أو الهوت لاين 17355. لا يمكن إرجاع المنتجات القابلة للتلف أو التي تم استخدامها.",
  );

  addChunk(
    chunks,
    "policy-privacy",
    "policy",
    "سياسة الخصوصية",
    ROUTES.PRIVACY,
    "توضح سياسة الخصوصية كيفية جمع واستخدام وحماية بيانات العملاء. تستخدم البيانات لمعالجة الطلبات، خدمة العملاء، تحسين الموقع، والتحليلات. لا تبيع مؤسسة المغربي البيانات الشخصية لأطراف ثالثة لأغراض تسويقية. للاستفسارات: info@sokanyelmaghraby.com.",
  );

  if (termsPage?.html) {
    addChunk(
      chunks,
      "policy-terms",
      "policy",
      "الشروط والأحكام",
      ROUTES.TERMS,
      stripHtml(termsPage.html),
    );
  } else {
    addChunk(
      chunks,
      "policy-terms-fallback",
      "policy",
      "الشروط والأحكام",
      ROUTES.TERMS,
      "صفحة الشروط والأحكام تعرض النص المعتمد من الموقع الرسمي لوكيل سوكاني في مصر. إذا لم تتوفر التفاصيل داخل الشات، افتح صفحة الشروط والأحكام للمراجعة الكاملة.",
    );
  }

  if (warrantyPage?.html) {
    addChunk(
      chunks,
      "policy-warranty",
      "policy",
      "الضمان والصيانة",
      ROUTES.WARRANTY,
      stripHtml(warrantyPage.html),
    );
  } else {
    addChunk(
      chunks,
      "policy-warranty-fallback",
      "policy",
      "الضمان والصيانة",
      ROUTES.WARRANTY,
      "منتجات سوكاني لها ضمان رسمي وخدمات صيانة وقطع غيار أصلية عبر مؤسسة المغربي. راجع صفحة الضمان والصيانة للتفاصيل المعتمدة وطرق الاستخدام.",
    );
  }

  for (const product of productsResult.products) {
    addChunk(
      chunks,
      `product-${product.id}`,
      "product",
      product.name,
      ROUTES.PRODUCT(product.id),
      compactText(
        product.name,
        product.sku ? `كود المنتج: ${product.sku}` : "",
        product.categories.map((category) => category.name).join("، "),
        product.tags.map((tag) => tag.name).join("، "),
        "استخدم هذا المنتج في ردود البيع المختصرة: اذكر الفائدة العملية والمواصفات المتاحة فقط.",
        product.attributes
          .filter((attribute) => attribute.visible)
          .map((attribute) => `${attribute.name}: ${attribute.options.join("، ")}`)
          .join(". "),
        `السعر الحالي العام: ${formatCurrency(product.price)}`,
        product.salePrice
          ? `سعر العرض: ${formatCurrency(product.salePrice)}`
          : "",
        `السعر قبل الخصم: ${formatCurrency(product.regularPrice)}`,
        stripHtml(product.shortDescription),
        stripHtml(product.description),
        product.inStock ? "الحالة العامة: متاح في الكتالوج" : "الحالة العامة: غير متوفر حاليا",
        product.relatedIds.length > 0
          ? `منتجات ذات صلة للـ cross-sell: ${product.relatedIds.join(", ")}`
          : "",
        product.onSale ? "هذا المنتج ضمن العروض عند توفر السعر في صفحة المنتج." : "",
      ),
    );
  }

  for (const category of categories) {
    if (category.count <= 0) continue;
    addChunk(
      chunks,
      `category-${category.id}`,
      "category",
      category.name,
      ROUTES.CATEGORY(category.slug),
      compactText(
        category.name,
        stripHtml(category.description),
        `عدد المنتجات العامة في التصنيف: ${category.count}`,
      ),
    );
  }

  if (siteContent.branches.service.length > 0) {
    addChunk(
      chunks,
      "branches-service-summary",
      "branch",
      "عناوين فروع الصيانة ومراكز الخدمة",
      ROUTES.SERVICE_CENTERS,
      siteContent.branches.service
        .map(
          (branch) =>
            `عنوان فرع الصيانة ${branch.name}: ${branch.address}. رقم التواصل: ${branch.whatsapp}`,
        )
        .join(" | "),
    );
  }

  if (siteContent.branches.sales.length > 0) {
    addChunk(
      chunks,
      "branches-sales-summary",
      "branch",
      "عناوين فروع البيع والمعاينة",
      ROUTES.SERVICE_CENTERS,
      siteContent.branches.sales
        .map(
          (branch) =>
            `عنوان فرع البيع والمعاينة ${branch.name}: ${branch.address}`,
        )
        .join(" | "),
    );
  }

  for (const branch of siteContent.branches.sales) {
    addChunk(
      chunks,
      `branch-sales-${branch.name}`,
      "branch",
      branch.name,
      ROUTES.SERVICE_CENTERS,
      compactText(
        "عنوان فرع البيع والمعاينة",
        "فروع البيع",
        branch.name,
        branch.address,
      ),
    );
  }

  for (const branch of siteContent.branches.service) {
    addChunk(
      chunks,
      `branch-service-${branch.name}`,
      "branch",
      branch.name,
      ROUTES.SERVICE_CENTERS,
      compactText(
        "عنوان فرع الصيانة",
        "مركز صيانة",
        "مراكز الخدمة",
        "فروع الصيانة",
        branch.name,
        branch.address,
        `واتساب أو اتصال: ${branch.whatsapp}`,
      ),
    );
  }

  for (const retailer of siteContent.retailers.list) {
    addChunk(
      chunks,
      `retailer-${retailer.name}`,
      "retailer",
      retailer.name,
      ROUTES.RETAILERS,
      compactText(
        "موزع معتمد",
        retailer.name,
        retailer.location,
        retailer.governorate,
        `هاتف: ${retailer.phone}`,
      ),
    );
  }

  return chunks;
}

export const collectPublicKnowledge = unstable_cache(
  collectPublicKnowledgeUncached,
  ["assistant-public-knowledge-v4"],
  { revalidate: 900, tags: ["assistant-public-knowledge"] },
);
