import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Building2,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";

export type ProductTrustStripItem = {
  id: string;
  title: string;
  body: string;
  icon: LucideIcon;
  href: string;
  linkLabel: string;
  summaryPoints: readonly string[];
};

const STATIC_TRUST_ITEMS: ProductTrustStripItem[] = [
  {
    id: "warranty",
    title: "ضمان الوكيل",
    body: "سنة ضد عيوب الصناعة",
    icon: ShieldCheck,
    href: ROUTES.WARRANTY,
    linkLabel: "تفاصيل الضمان الكاملة",
    summaryPoints: [
      "سنة ضد عيوب الصناعة على أجهزة سوكاني الأصلية.",
      "احتفظ بفاتورة الشراء من الوكيل الحصري لتفعيل الضمان.",
      "صيانة وقطع غيار أصلية في مراكز خدمة معتمدة.",
    ],
  },
  {
    id: "cod",
    title: "دفع عند الاستلام",
    body: "ادفع عند استلام طلبك",
    icon: Banknote,
    href: ROUTES.CHECKOUT,
    linkLabel: "إتمام الطلب والدفع",
    summaryPoints: [
      "ادفع نقداً أو ببطاقة عند استلام الطلب من المندوب.",
      "متاح لمعظم محافظات التوصيل داخل مصر.",
      "اختر «الدفع عند الاستلام» عند إتمام الطلب.",
    ],
  },
  {
    id: "returns",
    title: "استبدال واسترجاع",
    body: "حسب الشروط خلال 14 يوم",
    icon: RotateCcw,
    href: ROUTES.RETURNS_POLICY,
    linkLabel: "سياسة الاسترجاع الكاملة",
    summaryPoints: [
      "يمكنك الإرجاع خلال 14 يوماً من تاريخ الشراء.",
      "يجب أن يكون المنتج في حالته الأصلية وغير مستخدم.",
      "مع تقديم الفاتورة أو إثبات الشراء — للاستفسار اتصل على 17355.",
    ],
  },
  {
    id: "delivery",
    title: "توصيل سريع",
    body: "خلال 1-3 أيام عمل",
    icon: Truck,
    href: ROUTES.CONTACT,
    linkLabel: "استفسار عن التوصيل",
    summaryPoints: [
      "توصيل خلال 1–3 أيام عمل لمعظم محافظات مصر.",
      "يُحسب الشحن عند إتمام الطلب حسب المحافظة.",
      "للاستفسار عن منطقتك تواصل مع خدمة العملاء.",
    ],
  },
];

function branchesItem(branchTotal: number): ProductTrustStripItem {
  return {
    id: "branches",
    title:
      branchTotal > 0 ? `${branchTotal} فرع ومركز خدمة` : "فروع ومراكز خدمة",
    body: "بيع وصيانة ودعم داخل مصر، والتفاصيل النهائية حسب فاتورة الشراء.",
    icon: Building2,
    href: ROUTES.SERVICE_CENTERS,
    linkLabel: "عرض الفروع ومراكز الصيانة",
    summaryPoints: [
      "بيع وصيانة ودعم داخل مصر عبر شبكة مؤسسة المغربي.",
      "فروع بيع ومراكز صيانة معتمدة في مختلف المحافظات.",
      "اتصل على 17355 لإرشادك لأقرب فرع أو مركز خدمة.",
    ],
  };
}

export function buildProductTrustStripItems(
  branchTotal: number,
): ProductTrustStripItem[] {
  return [...STATIC_TRUST_ITEMS, branchesItem(branchTotal)];
}
