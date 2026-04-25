/**
 * الموزعون المعتمدون — عناوين وصور ومحافظات للفلترة على صفحة `/retailers`.
 * استبدل `imageSrc` بصور واجهات حقيقية عند توفرها (`/public/images/...`).
 */
export type AuthorizedRetailer = {
  name: string;
  location: string;
  /** محافظة للفلترة (اسم عربي موحّد). */
  governorate: string;
  /** مسار عام أو URL مسموح في `next.config` للصور. */
  imageSrc: string;
  /** رقم موبايل محلي (01…) أو رقم خدمة قصير مثل 16291. */
  phone: string;
  /** رابط خرائط جاهز أو يُبنى من العنوان عند الغياب. */
  googleMapsUrl?: string;
};

export const retailersMapHeroSrc =
  "https://img.freepik.com/free-vector/egypt-map-with-location-pins_23-2148286431.jpg";

export const authorizedRetailers = [
  {
    name: "سنتر شاهين — فرع أكتوبر",
    location: "أبراج المدينة 1 — المحور المركزي، 6 أكتوبر",
    governorate: "الجيزة",
    imageSrc: "/images/placeholder.png",
    phone: "16291",
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=%D8%A3%D8%A8%D8%B1%D8%A7%D8%AC%20%D8%A7%D9%84%D9%85%D8%AF%D9%8A%D9%86%D8%A9%201%20%D8%A7%D9%84%D9%85%D8%AD%D9%88%D8%B1%20%D8%A7%D9%84%D9%85%D8%B1%D9%83%D8%B2%D9%8A%20%D8%A3%D9%83%D8%AA%D9%88%D8%A8%D8%B1",
  },
  {
    name: "تاج بسام — الزقازيق",
    location: "شارع د/ طلبة عويضة — الزقازيق",
    governorate: "الشرقية",
    imageSrc: "/images/placeholder.png",
    phone: "01044001071",
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=%D8%AA%D8%A7%D8%AC%20%D8%A8%D8%B3%D8%A7%D9%85%20%D8%A7%D9%84%D8%B2%D9%82%D8%A7%D8%B2%D9%8A%D9%82",
  },
  {
    name: "معرض معتمد — الإسكندرية (مثال)",
    location: "33 ش د/ عبدالحميد بدوي — الأزاريطة",
    governorate: "الإسكندرية",
    imageSrc: "/images/placeholder.png",
    phone: "01044001054",
  },
  {
    name: "معرض معتمد — الفيوم (مثال)",
    location: "50 ش توفيق — الفوال",
    governorate: "الفيوم",
    imageSrc: "/images/placeholder.png",
    phone: "01044001057",
  },
] satisfies AuthorizedRetailer[];

/** محافظات مميزة من البيانات + «كل المحافظات» في الواجهة. */
export function distinctGovernorates(
  list: readonly AuthorizedRetailer[],
): string[] {
  const set = new Set(list.map((r) => r.governorate.trim()));
  return [...set].sort((a, b) => a.localeCompare(b, "ar"));
}
