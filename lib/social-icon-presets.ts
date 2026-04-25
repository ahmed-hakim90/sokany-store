/**
 * خيارات أيقونات السوشيال في لوحة التحكم — المفتاح يُخزَّن في CMS ويُمرَّر لـ SocialGlyph.
 */
export type SocialIconPreset = {
  key: string;
  labelAr: string;
};

export const SOCIAL_ICON_PRESETS: readonly SocialIconPreset[] = [
  { key: "facebook", labelAr: "فيسبوك" },
  { key: "instagram", labelAr: "إنستغرام" },
  { key: "youtube", labelAr: "يوتيوب" },
  { key: "whatsapp", labelAr: "واتساب" },
  { key: "tiktok", labelAr: "تيك توك" },
  { key: "x", labelAr: "إكس (تويتر)" },
  { key: "linkedin", labelAr: "لينكدإن" },
  { key: "telegram", labelAr: "تيليجرام" },
  { key: "snapchat", labelAr: "سناب شات" },
  { key: "pinterest", labelAr: "بينتيرست" },
] as const;

const PRESET_KEY_SET = new Set(
  SOCIAL_ICON_PRESETS.map((p) => p.key.toLowerCase()),
);

export function isKnownSocialIconKey(key: string): boolean {
  return PRESET_KEY_SET.has(key.trim().toLowerCase());
}
