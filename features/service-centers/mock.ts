import type { ServiceCenter } from "@/features/service-centers/types";

/** Placeholder branches — swap for API or CMS later. */
export const mockServiceCenters: ServiceCenter[] = [
  {
    id: "1",
    name: "الفرع الرئيسي — القاهرة",
    city: "القاهرة",
    description: "استقبال، صيانة، واستعلامات الوكالة.",
    address: "15 شارع الجمهورية، وسط البلد",
    phone: "+20 2 0000 0000",
    featured: true,
    mapUrl: "https://maps.google.com/?q=Cairo+Egypt",
    imageSrc: "/images/hero-banner.jpg",
  },
  {
    id: "2",
    name: "مركز خدمة — الجيزة",
    city: "الجيزة",
    description: "فرع خدمة سريع بالدائري.",
    address: "محور الدائري، بالقرب من ميدان لبنان",
    phone: "+20 2 0000 0001",
    mapUrl: "https://maps.google.com/?q=Giza+Egypt",
    imageSrc: "/images/placeholder.png",
  },
  {
    id: "3",
    name: "معرض الإسكندرية",
    city: "الإسكندرية",
    description: "معرض ومبيعات في سموحة.",
    address: "سموحة، شارع فيكتور عمانويل",
    phone: "+20 3 0000 0000",
    mapUrl: "https://maps.google.com/?q=Alexandria+Egypt",
    imageSrc: "/images/placeholder.png",
  },
];
