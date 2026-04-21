/** روابط السوشيال الافتراضية — تُستبدل بمحتوى CMS عند تعبئته. */
export type SocialLink = {
  key: string;
  href: string;
  label: string;
};

/** Same destinations as OrganizationJsonLd `sameAs` + primary contact. */
export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    key: "facebook",
    href: "https://www.facebook.com/SokanyElmaghraby",
    label: "Facebook",
  },
  {
    key: "instagram",
    href: "https://www.instagram.com/SokanyElmaghraby",
    label: "Instagram",
  },
  {
    key: "youtube",
    href: "https://www.youtube.com/@SokanyElmaghraby",
    label: "YouTube",
  },
] as const;
