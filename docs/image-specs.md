# Image specs — Sokany Store

## العربية

الواجهة تميّز بين **ملء الإطار مع قص** (`object-cover`) و**إظهار الصورة كاملة مع هامش محتمل** (`object-contain`). **`AppImage`** يفترض `object-cover` في الـ `className` الافتراضي؛ لتجنب القص، مرّر `object-contain` في `className` (مثل بطاقة المنتج). المصممون: الأبعاد والنسب التفصيلية والمسارات العامة للأصول في [`docs/design-image-sizes-ar.md`](design-image-sizes-ar.md) — **هذا الملف مختصر**؛ المرجع الكامل هناك.

**صيانة:** عند تغيير نسب البانر أو الهيرو، حدّث `design-image-sizes-ar.md` و`public/images/*/README.md` معاً.

---

## English — `AppImage` & Next config

- Wrapper: [`components/AppImage.tsx`](../components/AppImage.tsx) — default Tailwind includes **`object-cover`**; override with `className` (e.g. **`object-contain`** on [`features/products/components/ProductCard.tsx`](../features/products/components/ProductCard.tsx)).
- Woo product URLs may use `unoptimized` when hosted on known Woo hosts — see `isWooHostedProductImageUrl` in source.
- **Allowed remote hosts:** [`next.config.ts`](../next.config.ts) `images.remotePatterns` — includes `sokany-eg.com` / `www` wp-content paths, Freepik, Firebase Storage, and dynamic patterns from `NEXT_PUBLIC_SITE_URL`.

---

## English — Designer export cheat sheet

| Use case | Aspect / size hint | Display mode | Code / doc |
|----------|-------------------|--------------|------------|
| Home hero slides | ~**11∶18** (e.g. 330×540, 2× for retina) | `object-cover` | [`public/images/hero/README.md`](../public/images/hero/README.md), `home-hero-banner` |
| Category exclusive banner | **16∶5** (e.g. 1600×500) | `object-cover` in `aspect-[16/5]` | [`public/images/banner-section/README.md`](../public/images/banner-section/README.md), `HomeCategoryExclusiveBanner` |
| Product card grid | Square source preferred | **`object-contain`** | `ProductCard` |
| PDP gallery main | Square frame | default `cover`; lightbox **`contain`** | `ProductGallery`, `product-gallery-lightbox` |
| Category images in Woo | ≥**1200px** wide or ≥**1000×1000** | varies by placement | [`docs/design-image-sizes-ar.md`](design-image-sizes-ar.md) |

---

## English — Static asset HTTP caching

- Hero images under `/images/hero/*` get long `Cache-Control` + `stale-while-revalidate` — [`next.config.ts`](../next.config.ts) `headers`.

---

## Related

- [`docs/design-image-sizes-ar.md`](design-image-sizes-ar.md) — full Arabic reference + component map
- [`docs/frontend-guidelines.md`](frontend-guidelines.md) — always use `AppImage` / `next/image`
- [`docs/caching-strategy.md`](caching-strategy.md) — CDN headers vs PWA image cache
