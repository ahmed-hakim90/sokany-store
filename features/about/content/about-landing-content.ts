import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Headphones,
  MapPin,
  Package,
  Shield,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";

export const ABOUT_LANDING_META = {
  title: "سوكاني مصر | مؤسسة المغربي الوكيل الحصري لسوكاني في مصر",
  description:
    "تعرف على مؤسسة المغربي الوكيل الحصري لسوكاني في مصر. أجهزة سوكاني الأصلية بضمان رسمي وصيانة معتمدة وقطع غيار أصلية.",
  keywords: [
    "سوكاني مصر",
    "الوكيل الحصري لسوكاني",
    "مؤسسة المغربي",
    "ضمان سوكاني",
    "صيانة سوكاني",
    "منتجات سوكاني الأصلية",
    "Sokany Egypt",
    "أجهزة سوكاني",
    "وكيل سوكاني في مصر",
  ],
} as const;

export const aboutLandingHero = {
  h1Before: "سوكاني مصر — ",
  h1Highlight: "الجودة العالمية",
  h1After: " مع مؤسسة المغربي الوكيل الحصري في مصر",
  subtitle:
    "اكتشف أجهزة سوكاني الأصلية في مصر بضمان رسمي، صيانة معتمدة، وقطع غيار أصلية من خلال مؤسسة المغربي.",
  primaryCta: { label: "تسوق المنتجات", href: ROUTES.PRODUCTS },
  secondaryCta: { label: "اعرف خدمات الضمان", href: ROUTES.WARRANTY },
  collage: [
    {
      src: "/images/banner-section/04-mixer.jpeg",
      alt: "خلاط وعجان سوكاني",
    },
    {
      src: "/images/banner-section/07-kabbh.jpeg",
      alt: "قلاية هوائية سوكاني",
    },
    {
      src: "/images/banner-section/01-kitchen.jpeg",
      alt: "أجهزة مطبخ سوكاني",
    },
    {
      src: "/images/banner-section/03-personal.jpeg",
      alt: "عناية شخصية سوكاني",
    },
  ],
} as const;

export const aboutLandingWhoWeAre = {
  title: "من هي مؤسسة المغربي؟",
  paragraphs: [
    "مؤسسة المغربي هي الشريك الرسمي والوكيل الحصري لعلامة سوكاني في جمهورية مصر العربية. نتولى توزيع منتجات سوكاني الأصلية عبر شبكة تجزئة واسعة، مع ضمان رسمي على كل جهاز وصيانة معتمدة وقطع غيار أصلية.",
    "من خلال خبرة تمتد لسنوات في السوق المصري، نربط بين جودة سوكاني العالمية وثقة العميل المحلي — من اختيار المنتج حتى ما بعد البيع عبر مراكز خدمة وخط ساخن موحّد.",
  ],
  imageSrc: "/images/hero/home-appliances-4.jpg",
  imageAlt: "مؤسسة المغربي — الوكيل الحصري لسوكاني في مصر",
  timeline: [
    { label: "بداية التعاون", icon: Sparkles },
    { label: "التوزيع", icon: Truck },
    { label: "الضمان", icon: Shield },
    { label: "الصيانة", icon: Wrench },
    { label: "التوسع", icon: MapPin },
  ] as const satisfies ReadonlyArray<{ label: string; icon: LucideIcon }>,
} as const;

export type AboutValueCard = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const aboutLandingWhyCards: AboutValueCard[] = [
  {
    title: "ضمان رسمي",
    description: "ضمان معتمد على جميع منتجات سوكاني وفق سياسات الوكيل الحصري في مصر.",
    icon: Shield,
  },
  {
    title: "صيانة معتمدة",
    description: "فنيون مدربون وإجراءات صيانة موحّدة تحافظ على أداء جهازك.",
    icon: Wrench,
  },
  {
    title: "قطع غيار أصلية",
    description: "قطع غيار أصلية متوفرة لضمان عمر أطول وكفاءة ثابتة.",
    icon: Package,
  },
  {
    title: "انتشار على مستوى الجمهورية",
    description: "توزيع رسمي يصل بمنتجات سوكاني إلى محافظات مصر عبر شبكة معتمدة.",
    icon: MapPin,
  },
  {
    title: "خدمة عملاء",
    description: "دعم محلي بالعربية للاستفسارات عن المنتجات والضمان والطلبات.",
    icon: Headphones,
  },
  {
    title: "مراكز صيانة",
    description: "شبكة مراكز خدمة لتقليل المسافة بينك وبين الصيانة المعتمدة.",
    icon: BadgeCheck,
  },
];

export const aboutLandingStory = {
  title: "قصة سوكاني ومؤسسة المغربي",
  paragraphs: [
    "سوكاني علامة عالمية في الأجهزة المنزلية والمطبخ والعناية الشخصية — تجمع بين التصميم العصري والتكنولوجيا العملية. في مصر، تتولى مؤسسة المغربي تمثيل العلامة رسمياً كوكيل حصري: من استيراد المنتجات الأصلية إلى خدمة ما بعد البيع.",
    "شراكتنا تهدف إلى أن يجد كل عميل مصري جهاز سوكاني بثقة كاملة: منتج أصلي، ضمان واضح، ومسار صيانة معروف — لأن الجودة العالمية تستحق دعماً محلياً يعكسها.",
  ],
  imageSrc: "/images/banner-section/01-kitchen.jpeg",
  imageAlt: "أجهزة مطبخ سوكاني في بيئة منزلية عصرية",
  badges: [
    "منتجات أصلية 100%",
    "وكيل حصري في مصر",
    "ضمان وصيانة معتمدة",
  ],
} as const;

export type { FeaturedCategoryTile as AboutCategoryTile } from "@/features/categories/content/featured-category-tiles";
export { featuredCategoryTiles as aboutLandingCategories } from "@/features/categories/content/featured-category-tiles";

export const aboutLandingServiceNetwork = {
  title: "شبكة الخدمة في مصر",
  subtitle: "مراكز صيانة وضمان تغطي القاهرة والجيزة والمحافظات — مع خط ساخن موحّد.",
  mapCaption: "مراكز خدمة في مختلف المحافظات",
  mapCta: { label: "اعرف أقرب مركز صيانة", href: ROUTES.SERVICE_CENTERS },
  regions: [
    { title: "القاهرة", stat: "35+", description: "فروع ومراكز خدمة في العاصمة" },
    { title: "الجيزة", stat: "20+", description: "تغطية واسعة في محافظة الجيزة" },
    { title: "المحافظات", stat: "27+", description: "انتشار على مستوى الجمهورية" },
    { title: "مراكز الصيانة", stat: "100+", description: "مراكز ضمان وصيانة معتمدة" },
  ],
  branchesCta: { label: "عرض جميع الفروع", href: ROUTES.SERVICE_CENTERS },
} as const;

export const aboutLandingStats = [
  { value: 150, prefix: "+", suffix: "", label: "منتج أصلي" },
  { value: 12, prefix: "+", suffix: "", label: "فئة منتجات" },
  { value: 27, prefix: "+", suffix: "", label: "محافظة" },
  { value: 100, prefix: "+", suffix: "", label: "مركز خدمة" },
  { value: 17355, prefix: "", suffix: "", label: "الخط الساخن", isHotline: true },
] as const;

export const aboutLandingTrust = {
  title: "ثقة الوكيل الحصري",
  items: [
    {
      title: "ضمان رسمي",
      description: "ضمان معتمد على منتجات سوكاني الأصلية عبر مؤسسة المغربي.",
      icon: Shield,
    },
    {
      title: "قطع غيار أصلية",
      description: "قطع غيار أصلية متوفرة لصيانة آمنة وطويلة الأمد.",
      icon: Package,
    },
    {
      title: "صيانة معتمدة",
      description: "مراكز صيانة مدربة على معايير العلامة العالمية.",
      icon: Wrench,
    },
    {
      title: "دعم العملاء",
      description: "فريق دعم محلي للإجابة عن الضمان والمنتجات والفروع.",
      icon: Headphones,
    },
  ],
} as const;

export type AboutFaqItem = { question: string; answer: string };

export const aboutLandingFaq: AboutFaqItem[] = [
  {
    question: "هل مؤسسة المغربي هي الوكيل الحصري لسوكاني؟",
    answer:
      "نعم. مؤسسة المغربي هي الوكيل الحصري والرسمي لعلامة سوكاني في جمهورية مصر العربية، وتتولى التوزيع والضمان والصيانة وقطع الغيار الأصلية.",
  },
  {
    question: "هل منتجات سوكاني أصلية؟",
    answer:
      "جميع المنتجات المعروضة عبر قنوات الوكيل الحصري أصلية ومستوردة رسمياً لسوكاني مصر، مع ضمان يثبت مصدر الجهاز.",
  },
  {
    question: "هل يوجد ضمان؟",
    answer:
      "نعم. يتوفر ضمان رسمي على أجهزة سوكاني وفق سياسة الوكيل. للتفاصيل راجع صفحة الضمان وطرق الاستخدام أو تواصل مع خدمة العملاء.",
  },
  {
    question: "كيف أصل للصيانة؟",
    answer:
      "يمكنك الاتصال بالخط الساخن 17355 أو زيارة أقرب فرع أو مركز صيانة معتمد من صفحة الفروع ومراكز الخدمة على الموقع.",
  },
  {
    question: "هل توجد قطع غيار؟",
    answer:
      "نعم. تتوفر قطع غيار أصلية لمعظم الأجهزة عبر شبكة الصيانة المعتمدة لمؤسسة المغربي — استفسر عند مركز الخدمة أو عبر الهوت لاين.",
  },
];

export const aboutLandingFinalCta = {
  title: "تسوق أجهزة سوكاني الأصلية الآن",
  subtitle: "بضمان رسمي من مؤسسة المغربي",
  primaryCta: { label: "تصفح المنتجات", href: ROUTES.PRODUCTS },
  secondaryCta: { label: "تواصل معنا", href: ROUTES.CONTACT },
  imageSrc: "/images/hero/home-appliances-5.jpg",
  imageAlt: "أجهزة سوكاني للمطبخ والمنزل",
} as const;

export const aboutPartnershipJsonLd = {
  distributorName: "مؤسسة المغربي",
  brandName: "سوكاني مصر",
  description:
    "مؤسسة المغربي الوكيل الحصري لسوكاني في مصر — توزيع أجهزة سوكاني الأصلية بضمان رسمي وصيانة معتمدة وقطع غيار أصلية.",
} as const;
