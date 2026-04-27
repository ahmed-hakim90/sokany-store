export type EgyptGovernorate = {
  code: string;
  nameAr: string;
};

export const EGYPT_GOVERNORATES = [
  { code: "C", nameAr: "القاهرة" },
  { code: "GZ", nameAr: "الجيزة" },
  { code: "ALX", nameAr: "الإسكندرية" },
  { code: "DK", nameAr: "الدقهلية" },
  { code: "BA", nameAr: "البحر الأحمر" },
  { code: "BH", nameAr: "البحيرة" },
  { code: "FYM", nameAr: "الفيوم" },
  { code: "GH", nameAr: "الغربية" },
  { code: "IS", nameAr: "الإسماعيلية" },
  { code: "MNF", nameAr: "المنوفية" },
  { code: "MN", nameAr: "المنيا" },
  { code: "KB", nameAr: "القليوبية" },
  { code: "WAD", nameAr: "الوادي الجديد" },
  { code: "SUZ", nameAr: "السويس" },
  { code: "ASN", nameAr: "أسوان" },
  { code: "AST", nameAr: "أسيوط" },
  { code: "BNS", nameAr: "بني سويف" },
  { code: "PTS", nameAr: "بورسعيد" },
  { code: "DT", nameAr: "دمياط" },
  { code: "SHR", nameAr: "الشرقية" },
  { code: "JS", nameAr: "جنوب سيناء" },
  { code: "KFS", nameAr: "كفر الشيخ" },
  { code: "MT", nameAr: "مطروح" },
  { code: "LX", nameAr: "الأقصر" },
  { code: "KN", nameAr: "قنا" },
  { code: "SIN", nameAr: "شمال سيناء" },
  { code: "SHG", nameAr: "سوهاج" },
] as const satisfies readonly EgyptGovernorate[];

function normalizeGovernorateValue(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function findEgyptGovernorate(value: string): EgyptGovernorate | undefined {
  const normalized = normalizeGovernorateValue(value);
  if (!normalized) return undefined;

  return EGYPT_GOVERNORATES.find(
    (governorate) =>
      normalizeGovernorateValue(governorate.code) === normalized ||
      normalizeGovernorateValue(governorate.nameAr) === normalized,
  );
}
