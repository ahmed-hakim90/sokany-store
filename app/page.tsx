import type { Metadata } from "next";
import { HomePageContent } from "@/components/pages/HomePageContent";
import { getHeroSlides } from "@/features/home/services/getHeroSlides";
import { getSiteUrl } from "@/lib/site";

const defaultOgImage =
  "https://sokany-eg.com/wp-content/uploads/2022/08/SOKANY-EG-2png.png";

export const metadata: Metadata = {
  title: "سوكانى المغربى | أجهزة كهربائية منزلية ومطبخ",
  description:
    "تسوق أجهزة سوكانى الكهربائية بأفضل الأسعار في مصر. أجهزة مطبخ، منزلية، وعناية شخصية من الوكيل الحصري مؤسسة المغربى.",
  keywords: [
    "سوكانى",
    "أجهزة كهربائية",
    "أجهزة مطبخ",
    "سوكانى مصر",
    "sokany egypt",
  ],
  openGraph: {
    title: "سوكانى المغربى | الوكيل الحصري في مصر",
    description: "أفضل أسعار أجهزة سوكانى الكهربائية في مصر",
    url: getSiteUrl(),
    siteName: "سوكانى المغربى",
    locale: "ar_EG",
    type: "website",
    images: [{ url: defaultOgImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "سوكانى المغربى",
    description: "أجهزة سوكانى الكهربائية من الوكيل الحصري",
    images: [defaultOgImage],
  },
  alternates: { canonical: getSiteUrl() },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default async function Home() {
  const heroSlides = await getHeroSlides();
  return <HomePageContent heroSlides={heroSlides} />;
}
