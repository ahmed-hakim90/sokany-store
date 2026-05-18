import { Container } from "@/components/Container";
import { HomePageInteractiveClient } from "./HomePageInteractiveClient";
import type { HomePageContentProps } from "./home-page-types";

/*
 * الصفحة الرئيسية (/): عمود واحد داخل Container بمسافات رأسية (sm → md).
 * ‎`max-lg`‎: هالة ليمون خلف الهيرو عبر ‎`MobileHeroLimeAtmosphere`‎؛ غلاف الصفحة بلا ‎`bg`‎ على الموبايل.
 * التسلسل: هيرو (ديسكتوب: بانر + بطاقتا عروض | موبايل: سلايدر + رقائق) → اكتشاف التصنيفات → عروض الشهر
 * → كبسولة خدمات → الأكثر مبيعاً → وصل حديثاً → دعم العلامة → أقسام CMS/أب (سكة موبايل + شبكة ‎`lg`‎).
 *
 * أداء التحميل: ‎`app/(storefront)/page.tsx`‎ يجفّف TanStack فقط لسكة منتجات واحدة (العروض إن وُجدت، وإلا «الأكثر مبيعاً») + لا يُجفَّف التصنيفات لتقليل حمولة الترطيب؛ أسماء التصنيفات للهيرو تُبنى على الخادم وتُمرَّر كـ props.
 * أقسام المنتجات الأخرى تُفعَّل عند اقترابها من الشاشة (‎`useNearViewport`‎) — بدون ‎`ProductGrid`‎ ولا طلب ‎`/api/products`‎ قبل ذلك.
 * فشل التصنيفات: ‎`ErrorState`‎. فشل قسم مخصص: ‎`ErrorState`‎ داخل القسم.
 *
 * الحدُّ العلوي (‎`h1`‎ + ‎`Container`‎) خادم فقط؛ الجزء التفاعلي في ‎`HomePageInteractiveClient`‎ لتقليل ضغط الحزمة على الحدِّ الفاصل بين الخادم والعميل.
 */
export function HomePageShell(props: HomePageContentProps) {
  return (
    <div className="animate-fade-in bg-page max-lg:!bg-transparent">
      <Container className="space-y-5 pb-8  sm:space-y-6 sm:pb-10">
        <h1 className="sr-only">سوكاني المصرية - متجر أجهزة سوكاني في مصر</h1>
        <HomePageInteractiveClient {...props} />
      </Container>
    </div>
  );
}

export type { HomeBottomPromo, HomePageContentProps } from "./home-page-types";
