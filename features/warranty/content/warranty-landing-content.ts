import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Cpu,
  Filter,
  Headphones,
  MapPin,
  Package,
  Settings2,
  Shield,
  Wrench,
  Zap,
} from "lucide-react";
import { CONTACT_EMAIL, ROUTES, WHATSAPP_SUPPORT_URL } from "@/lib/constants";

export const WARRANTY_LANDING_META = {
  title: "ضمان سوكاني الرسمي في مصر | مؤسسة المغربي",
  description:
    "تعرف على ضمان وصيانة سوكاني في مصر من خلال مؤسسة المغربي. خدمات صيانة معتمدة وقطع غيار أصلية ومراكز خدمة رسمية.",
  keywords: [
    "ضمان سوكاني",
    "صيانة سوكاني",
    "الوكيل الرسمي سوكاني",
    "مراكز صيانة سوكاني",
    "ضمان مؤسسة المغربي",
    "خدمة عملاء سوكاني",
    "قطع غيار سوكاني",
    "سوكاني مصر",
    "مؤسسة المغربي",
  ],
} as const;

export const warrantyLandingHero = {
  h1: "ضمان سوكاني الرسمي في مصر",
  subtitle:
    "احصل على خدمات الضمان والصيانة وقطع الغيار الأصلية من خلال مؤسسة المغربي الوكيل الحصري لسوكاني في مصر.",
  primaryCta: { label: "اعرف مراكز الصيانة", href: ROUTES.SERVICE_CENTERS },
  secondaryCta: { label: "تواصل مع خدمة العملاء", href: ROUTES.CONTACT },
  collage: [
    { src: "/images/banner-section/04-mixer.jpeg", alt: "خلاط سوكاني — صيانة معتمدة" },
    { src: "/images/banner-section/07-kabbh.jpeg", alt: "قلاية هوائية سوكاني" },
    { src: "/images/hero/home-appliances-4.jpg", alt: "مركز خدمة سوكاني — أجهزة معتمدة" },
    { src: "/images/banner-section/01-kitchen.jpeg", alt: "أجهزة مطبخ سوكاني بضمان رسمي" },
  ],
  featureCards: [
    { title: "ضمان رسمي", description: "ضمان معتمد عبر الوكيل الحصري في مصر.", icon: Shield },
    { title: "صيانة معتمدة", description: "فنيون مدربون وإجراءات موحّدة للصيانة.", icon: Wrench },
    { title: "قطع غيار أصلية", description: "قطع أصلية لأداء آمن وعمر أطول.", icon: Package },
    { title: "خدمة عملاء", description: "خط ساخن ودعم بالعربية طوال أوقات العمل.", icon: Headphones },
  ] as const satisfies ReadonlyArray<{
    title: string;
    description: string;
    icon: LucideIcon;
  }>,
} as const;

export type WarrantyCoverageCard = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const warrantyLandingCoverage: WarrantyCoverageCard[] = [
  {
    title: "الأعطال الفنية",
    description: "معالجة الأعطال الفنية وفق شروط الضمان الرسمي لأجهزة سوكاني الأصلية.",
    icon: Zap,
  },
  {
    title: "خدمات الصيانة",
    description: "إصلاح وصيانة بجودة عالية في مراكز معتمدة عبر شبكة مؤسسة المغربي.",
    icon: Wrench,
  },
  {
    title: "قطع الغيار",
    description: "توفير قطع غيار أصلية معتمدة لضمان كفاءة الجهاز بعد الإصلاح.",
    icon: Package,
  },
  {
    title: "الدعم الفني",
    description: "استشارات فنية وإرشادات استخدام عبر خدمة العملاء والمراكز المعتمدة.",
    icon: Headphones,
  },
];

export const warrantyLandingSteps = [
  { step: 1, title: "شراء المنتج", description: "احتفظ بفاتورة الشراء من قنوات الوكيل الحصري." },
  { step: 2, title: "تفعيل الضمان", description: "سجّل بيانات الجهاز لتسهيل متابعة الضمان لاحقاً." },
  { step: 3, title: "طلب الخدمة", description: "اتصل بالخط الساخن 17355 أو تواصل مع أقرب مركز." },
  { step: 4, title: "الفحص", description: "فحص فني للجهاز لتحديد العطل وخطة الإصلاح." },
  { step: 5, title: "الصيانة", description: "إصلاح بقطع غيار أصلية وفق معايير العلامة." },
  { step: 6, title: "الاستلام", description: "استلام جهازك بعد اختبار الجودة والتأكد من الأداء." },
] as const;

export const warrantyLandingWhyCards: WarrantyCoverageCard[] = [
  {
    title: "مراكز معتمدة",
    description: "مراكز خدمة مجهّزة بمعدات حديثة ومعايير سوكاني العالمية.",
    icon: BadgeCheck,
  },
  {
    title: "فنيون متخصصون",
    description: "فريق فني مدرب على أجهزة سوكاني لضمان إصلاح دقيق.",
    icon: Settings2,
  },
  {
    title: "قطع أصلية",
    description: "قطع غيار أصلية 100% لجودة ثابتة وعمر تشغيل أطول.",
    icon: Package,
  },
  {
    title: "خدمة رسمية",
    description: "ضمان حقيقي من الوكيل الحصري — مؤسسة المغربي في مصر.",
    icon: Shield,
  },
  {
    title: "تغطية المحافظات",
    description: "شبكة مراكز تغطي القاهرة والجيزة ومحافظات الجمهورية.",
    icon: MapPin,
  },
];

export const warrantyLandingServiceNetwork = {
  title: "شبكة مراكز الخدمة والصيانة",
  subtitle: "مراكز ضمان وصيانة سوكاني المعتمدة عبر مؤسسة المغربي — في العاصمة وعموم مصر.",
  mapCaption: "مراكز خدمة في مختلف المحافظات",
  mapCta: { label: "اعرف أقرب مركز خدمة", href: ROUTES.SERVICE_CENTERS },
  regions: [
    { title: "القاهرة", stat: "35+", description: "مراكز وخدمة في العاصمة" },
    { title: "الجيزة", stat: "15+", description: "تغطية واسعة في محافظة الجيزة" },
    { title: "المحافظات", stat: "100+", description: "انتشار على مستوى الجمهورية" },
    { title: "مراكز الخدمة", stat: "معتمدة", description: "صيانة وضمان رسمي لسوكاني" },
  ],
} as const;

export const warrantyLandingSupport = {
  title: "خدمة عملاء سوكاني",
  subtitle: "فريق الدعم جاهز للإجابة عن الضمان والصيانة وقطع الغيار.",
  workingHours: "من 9 صباحاً حتى 10 مساءً — يومياً",
  email: CONTACT_EMAIL,
  whatsappUrl: WHATSAPP_SUPPORT_URL,
  callLabel: "اتصل الآن",
  whatsappLabel: "تواصل واتساب",
} as const;

export const warrantyLandingSpareParts = {
  title: "قطع غيار سوكاني الأصلية",
  paragraphs: [
    "نوفر قطع غيار أصلية لأجهزة سوكاني لضمان الأداء والاعتمادية — فقط عبر شبكة الصيانة المعتمدة لمؤسسة المغربي.",
    "الجودة والضمان على القطعة يعنيان جهازاً يعمل كما صُمم — بأمان وكفاءة على المدى الطويل.",
  ],
  pillars: ["قطع غيار أصلية", "اعتمادية", "جودة", "ضمان"],
  categories: [
    { title: "محركات ومكونات", icon: Cpu, imageSrc: "/images/banner-section/04-mixer.jpeg" },
    { title: "إكسسوارات وأدوات", icon: Settings2, imageSrc: "/images/banner-section/05-hand.jpeg" },
    { title: "شفرات وخلاطات", icon: Zap, imageSrc: "/images/banner-section/02-coffee.jpeg" },
    { title: "ملحقات", icon: Package, imageSrc: "/images/banner-section/03-personal.jpeg" },
    { title: "فلاتر وملحقات بخار", icon: Filter, imageSrc: "/images/banner-section/06-steam.jpeg" },
  ],
  cta: { label: "اطلب قطع غيار أصلية", href: ROUTES.CONTACT },
} as const;

export type WarrantyFaqItem = { question: string; answer: string };

export const warrantyLandingFaq: WarrantyFaqItem[] = [
  {
    question: "هل ضمان سوكاني رسمي؟",
    answer:
      "نعم. الضمان الرسمي لأجهزة سوكاني في مصر يُقدَّم عبر مؤسسة المغربي الوكيل الحصري — مع مراكز صيانة معتمدة وقطع غيار أصلية.",
  },
  {
    question: "هل توجد صيانة؟",
    answer:
      "نعم. تتوفر صيانة معتمدة في شبكة مراكز الخدمة عبر الجمهورية. يمكنك الاتصال بالخط الساخن 17355 أو زيارة أقرب فرع من صفحة الفروع.",
  },
  {
    question: "كيف أصل لمركز خدمة؟",
    answer:
      "استخدم صفحة الفروع ومراكز الصيانة على الموقع لمعرفة العنوان والخريطة، أو اتصل بـ 17355 لإرشادك لأقرب مركز.",
  },
  {
    question: "هل توجد قطع غيار؟",
    answer:
      "نعم. قطع غيار سوكاني الأصلية متوفرة عبر مراكز الصيانة المعتمدة — استفسر عند المركز أو عبر خدمة العملاء.",
  },
  {
    question: "كيف أتواصل مع الدعم؟",
    answer:
      "عبر الخط الساخن 17355، واتساب الدعم إن وُجد، البريد الإلكتروني، أو صفحة تواصل معنا على المتجر.",
  },
  {
    question: "هل الضمان عبر مؤسسة المغربي؟",
    answer:
      "نعم. مؤسسة المغربي هي الوكيل الحصري لسوكاني في مصر وتتولى الضمان والصيانة وقطع الغيار الأصلية رسمياً.",
  },
];

export const warrantyLandingFinalCta = {
  title: "ضمان رسمي وصيانة معتمدة لأجهزة سوكاني في مصر",
  subtitle: "من الشراء حتى ما بعد البيع — عبر مؤسسة المغربي الوكيل الحصري.",
  primaryCta: { label: "تصفح المنتجات", href: ROUTES.PRODUCTS },
  secondaryCta: { label: "تواصل معنا", href: ROUTES.CONTACT },
  imageSrc: "/images/hero/home-appliances-5.jpg",
  imageAlt: "أجهزة سوكاني بضمان رسمي وصيانة معتمدة",
} as const;

export const warrantyLandingInternalLinks = [
  { label: "من نحن", href: ROUTES.ABOUT },
  { label: "الفروع ومراكز الصيانة", href: ROUTES.SERVICE_CENTERS },
  { label: "تواصل معنا", href: ROUTES.CONTACT },
  { label: "المنتجات", href: ROUTES.PRODUCTS },
] as const;

export const warrantyPartnershipJsonLd = {
  distributorName: "مؤسسة المغربي",
  brandName: "سوكاني مصر",
  description:
    "ضمان وصيانة سوكاني الرسمي في مصر عبر مؤسسة المغربي — مراكز خدمة معتمدة وقطع غيار أصلية وخط ساخن 17355.",
} as const;
