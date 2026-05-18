"use client";

import { MobileAccordionSection } from "@/components/ui/mobile-accordion-section";
import { ProductDetailDescriptionBlocks } from "@/features/products/components/product-detail-description-blocks";
import { ProductDetailImageGallery } from "@/features/products/components/product-detail-image-gallery";
import { ProductSpecsList } from "@/features/products/components/ProductSpecsList";
import type { ProductSpecItem } from "@/features/products/components/ProductSpecsList";
import type { Product } from "@/features/products/types";
import { surfacePanelClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";

export type ProductDetailContentSectionsProps = {
  product: Product;
  specs: ProductSpecItem[];
  benefits: string[];
  reviewsSectionId?: string;
  className?: string;
};

/*
 * محتوى أسفل بطاقة الشراء في PDP:
 * — موبايل: أكورديون (وصف، مواصفات، صور، رابط للتقييمات).
 * — ديسكتوب (‎`lg`‎): أقسام مكدسة بعناوين واضحة (بدون تبويبات).
 */
export function ProductDetailContentSections({
  product,
  specs,
  benefits,
  reviewsSectionId = "product-reviews-section",
  className,
}: ProductDetailContentSectionsProps) {
  return (
    <section
      className={cn(
        surfacePanelClass,
        "overflow-hidden rounded-3xl",
        className,
      )}
      aria-label="تفاصيل إضافية للمنتج"
    >
      {/* موبايل: أكورديون — padding-inline يطابق الديسكتوب حتى لا يلتصق العنوان/المحتوى بحافة الكارت */}
      <div className="divide-y divide-slate-100 px-4 py-3 sm:px-5 sm:py-4 lg:hidden">
        <MobileAccordionSection title="الوصف" defaultOpen>
          <ProductDetailDescriptionBlocks product={product} />
          {benefits.length > 0 ? (
            <BenefitsList benefits={benefits} className="mt-4" />
          ) : null}
        </MobileAccordionSection>
        <MobileAccordionSection title="المواصفات" defaultOpen={false}>
          <ProductSpecsList items={specs} title="" variant="panel" />
        </MobileAccordionSection>
        {product.images.length > 1 ? (
          <MobileAccordionSection title="صور إضافية" defaultOpen={false}>
            <ProductDetailImageGallery product={product} />
          </MobileAccordionSection>
        ) : null}
        <MobileAccordionSection title="التقييمات" defaultOpen={false} noBorder>
          <p className="text-sm text-muted-foreground">
            اقرأ آراء العملاء وشارك تجربتك بعد الشراء.
          </p>
          <a
            href={`#${reviewsSectionId}`}
            className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-50"
          >
            الانتقال إلى التقييمات
          </a>
        </MobileAccordionSection>
      </div>

      {/* ديسكتوب: أقسام مكدسة */}
      <div className="hidden space-y-8 p-5 sm:p-6 lg:block">
        <DesktopBlock title="الوصف">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
            <ProductDetailDescriptionBlocks product={product} />
            {benefits.length > 0 ? <BenefitsList benefits={benefits} /> : null}
          </div>
        </DesktopBlock>
        <DesktopBlock title="المواصفات">
          <ProductSpecsList items={specs} title="" variant="panel" />
        </DesktopBlock>
        {product.images.length > 1 ? (
          <DesktopBlock title="صور إضافية">
            <ProductDetailImageGallery product={product} />
          </DesktopBlock>
        ) : null}
      </div>
    </section>
  );
}

function DesktopBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0">
      <h2 className="font-display text-lg font-bold tracking-tight text-slate-950">
        {title}
      </h2>
      <div className="mt-4 min-w-0">{children}</div>
    </section>
  );
}

function BenefitsList({
  benefits,
  className,
}: {
  benefits: string[];
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-slate-50/70 p-4",
        className,
      )}
    >
      <h3 className="font-display text-base font-bold text-slate-950">
        أبرز ما يميز المنتج
      </h3>
      <ul className="mt-3 grid gap-2">
        {benefits.map((item) => (
          <li
            key={item}
            className="flex min-w-0 items-start gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium leading-relaxed text-slate-800"
          >
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-950" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
