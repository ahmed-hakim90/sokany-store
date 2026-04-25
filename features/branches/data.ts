/**
 * عناوين وأرقام فروع البيع ومراكز الصيانة — يُحدَّث هنا فقط لسهولة الصيانة.
 */
export type SalesBranch = {
  name: string;
  address: string;
  /** رابط خرائط جوجل للفرع */
  googleMapsUrl: string;
};

export type ServiceBranch = {
  name: string;
  address: string;
  /** موبايل مصري للواتساب والاتصال (صيغة محلية 01…) */
  whatsapp: string;
};

export const branchesData = {
  sales: [
    {
      name: "فرع ستور أكتوبر بلازا (بيع ومعاينة)",
      address:
        "مول أكتوبر بلازا خلف سيلانترو الحصري - مدينة 6 أكتوبر",
      googleMapsUrl:
        "https://maps.app.goo.gl/Bwsj7WCNUeguAEdX7",
    },
  ] satisfies SalesBranch[],

  service: [
    {
      name: "القاهرة الرئيسي (وسط البلد)",
      address: "22 ا، شارع الجمهورية، غيط العدة، عابدين، محافظة القاهرة‬ 4283010",
      whatsapp: "01044001058",
    },
    {
      name: "القاهرة (أكتوبر الحصري)",
      address: "المحور المركزي أبراج المدينة 1 بجوار سنتر شاهين",
      whatsapp: "01044001056",
    },
    {
      name: "الدقهلية (المنصورة)",
      address: "ميدان الطميهي – برج الطاهري الدور 6",
      whatsapp: "01044001053",
    },
    {
      name: "الشرقية (الزقازيق)",
      address: "ش د/ طلبة عويضة ناصية «تاج بسام»",
      whatsapp: "01044001071",
    },
    {
      name: "الإسكندرية (الأزاريطة)",
      address: "33 ش د/ عبدالحميد بدوي الدور الأرضي",
      whatsapp: "01044001054",
    },
    {
      name: "الفيوم (الفوال)",
      address: "50 ش توفيق – الفوال – بجوار سنتر الصاف",
      whatsapp: "01044001057",
    },
    {
      name: "طنطا",
      address: "سيتم الافتتاح قريباً",
      whatsapp: "01044001057",
    },
  ] satisfies ServiceBranch[],
} as const;
