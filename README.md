# Sokany Store — Professional Headless E-commerce Starter

### Next.js 16 · React 19 · Headless WooCommerce · TanStack Query · Zod · Zustand · PWA

Pinned versions: see [`package.json`](package.json) (e.g. Next **16.2.x**, React **19.2.x**).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

High-performance, **production-oriented** storefront: **Arabic-first (RTL)**, feature-based architecture, and **WooCommerce** behind Next.js API routes so keys never reach the browser.

> **للمطورين العرب:** الـ README مبني على 3 أسئلة: **إيه ده؟** (القيمة) · **شغال بإيه؟** (التقنيات) · **أشغله إزاي؟** (الإعداد). التقنيات مذكورة بإصدارات المشروع الحقيقية (مش نسخ قديمة من الإنترنت).

---

## 1. What is this? (The value)

This is not a generic blog template — it is a **blueprint for scalable headless commerce**:

| You get | Why it matters |
|--------|----------------|
| **Headless WooCommerce** | Catalog, orders, and payments stay in WordPress; the storefront stays fast and deployable (e.g. Vercel). |
| **BFF-style API routes** (`/app/api/*`) | WooCommerce consumer secrets stay **server-only**; the client talks to your Next app only. |
| **Mock ↔ live** (`NEXT_PUBLIC_USE_MOCK`) | Build UI and flows without a live store, then flip one flag for real data. |
| **Service layer + Zod** | Responses are parsed at the boundary so unexpected API shapes surface as **controlled errors**, not random UI crashes. |
| **“Dumb” UI + hooks** | Components stay presentational; logic lives in hooks like `useCart`, `useProductsCatalog`, `useAuthSession`. |
| **Hydration-safe persisted state** | `useHasHydrated` avoids SSR/client mismatches for **Zustand + localStorage** (cart, auth). |
| **Optimistic UX** | Example: reviews use TanStack Query `onMutate` for instant feedback while the request completes. |
| **PWA** | Dynamic service worker from `/api/pwa-sw` (offline shell, caching strategy), `app/manifest.ts` for install metadata, icons, RTL, and theme colors; optional **FCM** web push when Firebase is configured. |
| **SEO** | JSON-LD helpers, sitemap, robots — oriented toward real product pages. |
| **Performance UX** | Large catalogs can use **virtualized** product grids (`@tanstack/react-virtual`); prefetch hooks for snappier PLP → PDP navigation. |

---

## 2. What powers it? (Tech stack)

Versions reflect **this repository** (`package.json`).

| Technology | Role |
|------------|------|
| **Next.js 16** | App Router, layouts, metadata, Route Handlers |
| **React 19** | UI |
| **Tailwind CSS v4** | Styling (`@tailwindcss/postcss`) |
| **TanStack React Query v5** | Server state, caching, mutations, devtools |
| **Zustand v5** | Client state (cart, auth) with persistence |
| **Zod v4** | Schemas for APIs and forms |
| **Axios** | HTTP from services |
| **jose** | JWT handling on the server |
| **Sonner** | Toasts |
| **Firebase** (optional) | Client SDK for auth / messaging; **Admin** for Firestore CMS, Storage uploads, and **FCM** server send — used by `/control` and public content merge |
| **@tanstack/react-virtual** | Windowed rendering for long product grids |
| **WordPress + WooCommerce** | Headless backend via **WooCommerce REST API** |
| **@vercel/speed-insights** | Optional Real User Monitoring on Vercel |

---

## 3. How do I run it? (Setup)

### Prerequisites

- **Node.js 20+** (recommended; aligns with `@types/node` in this repo)
- A **WordPress** site with **WooCommerce** installed and the **REST API** reachable
- WooCommerce **REST API keys** (Consumer Key / Consumer Secret) with appropriate permissions

### Installation

```bash
git clone https://github.com/YOUR_ORG/sokany-store.git
cd sokany-store
npm install
```

### Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`. Important variables:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_USE_MOCK` | `true` = mock data · `false` = real data via `/app/api/*` |
| `NEXT_PUBLIC_API_URL` | URL of this Next app (e.g. `http://localhost:3000`) |
| `WC_BASE_URL` | WordPress site URL (**server only** — never `NEXT_PUBLIC_`) |
| `WC_CONSUMER_KEY` / `WC_CONSUMER_SECRET` | WooCommerce REST credentials (**server only**) |
| `JWT_SECRET` | Secret for app-issued JWTs |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (metadata, SEO, optional image hosts) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 (`G-…`); **empty string disables** GA |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Microsoft Clarity project id; **empty string disables** Clarity |
| `NEXT_PUBLIC_FIREBASE_*` + `FIREBASE_SERVICE_ACCOUNT_JSON` | Optional — Firestore CMS, phone auth, web push (FCM + VAPID); see `.env.local.example` and [`docs/firebase-web-push-vapid.md`](docs/firebase-web-push-vapid.md) |

See `.env.local.example` for the full list (currency, locale, branding, webhooks, hotline, control session, etc.).

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build && npm run start   # production locally
npm run lint                     # ESLint
npm run test:e2e                 # Playwright (uses mock mode in config)
npm run analyze                  # bundle analyzer (webpack build)
```

---

## 4. Storefront features (ميزات الواجهة)

**تجربة المستخدم:** واجهة **عربية RTL**، عملة ومحلية قابلة للضبط من البيئة، وتركيز على **الموبايل أولاً** — انظر [رؤية المشروع](docs/project-vision.md).

| المسار / النطاق | ماذا يقدّم |
|-----------------|------------|
| **الرئيسية `/`** | شرائح فئات، عروض، شرائط ثقة، عدّ تنازلي لعروض محدودة |
| **الكتالوج** `/products`، `/categories`، `/categories/[slug]` | شبكة منتجات، تصفية وترتيب، اختصارات تصنيفات |
| **المنتج** `/products/[id]` | معرض صور، مواصفات، مراجعات، إضافة للسلة |
| **البحث** `/search` | بحث في المنتجات؛ **كلمات بحث سريعة** من إعدادات الموقع (CMS)؛ في `/control` يمكن جلب اقتراحات من وسوم Woo عبر `/api/control/search-quick-keyword-suggestions` (مسار **محمي** للمشرفين فقط). |
| **السلة والدفع** `/cart`، `/checkout` | سلة بأدراج على الموبايل/الديسكتوب، إتمام الطلب نحو WooCommerce |
| **الحساب والطلبات** `/account`، `/my-orders` | تسجيل/دخول، طلباتي |
| **التتبع** `/track-order` | متابعة حالة الطلب |
| **قائمة الأمنيات** `/wishlist` | حفظ المنتجات مع درج مخصص |
| **الثقة والمحتوى** `/about`، `/branches`، `/retailers` | من نحن، فروع مع روابط خرائط، موزّعون معتمدون |

**محتوى ديناميكي وعمليات (جديد نسبيًا في المستودع):**

| المسار / الموضوع | ماذا يقدّم |
|-------------------|------------|
| **CMS (Firestore)** | هيرو، بانرات أقسام، فروع، موزّعون، إعلانات مميزة، شريط إعلان، عروض محدودة — تُقرأ على الخادم مع تخزين مؤقت وإبطال عند الحفظ. |
| **لوحة التحكم** `/control` | تعديل إعدادات الموقع ورفع الوسائط؛ **إشعارات ويب** عبر FCM لموضوع المشتركين (مع تهيئة Firebase Admin و VAPID). |
| **PWA + FCM** | Service worker من `/api/pwa-sw` — صفحة offline، تخزين انتقائي؛ طبقة تجربة (بانر offline، سحب للتحديث، تثبيت مؤجل، تنبيه بيانات قديمة) عند الحاجة؛ إشعارات خلفية مع Firebase Messaging. |

شرح عربي مُكمل: [`docs/platform-features-ar.md`](docs/platform-features-ar.md).

---

## 5. Mobile shell & UX

- **كروم تجاري سفلي ثابت** — ملخص سلة + شريط تنقل سفلي في طبقة `fixed` واحدة؛ ارتفاع الكروم يُزامَن مع متغيّرات CSS حتى يبقى حشو المحتوى متسقًا (تفاصيل في [`docs/tech-audit.md`](docs/tech-audit.md)).
- **أدراج (Drawers)** — سلة، أمنيات، وفلاتر الكتالوج كطبقات بدل قفزات ثقيلة بين الصفحات حيث يناسب المنتج.
- **PWA** — [`app/manifest.ts`](app/manifest.ts) للتثبيت وألوان السمة واتجاه RTL؛ service worker ديناميكي يخدم الـ offline واستراتيجية التخزين.
- **شبكات الكتالوج** — للقوائم الطويلة قد تُعرَض المنتجات في شبكة **مُفَرَّغة** (virtualized) لسلاسة التمرير.
- **حالة الشبكة** — بانرات offline، سحب للتحديث، وتنبيهات بيانات قديمة تُحسّن الإحساس على الشبكات البطيئة (انظر `components/layout/storefront-*` و`hooks/useNetworkStatus`).

---

## 6. Analytics & monitoring (optional)

يُحمَّل من [`app/layout.tsx`](app/layout.tsx) عندما تكون المعرفات **غير فارغة** (المصدر: [`lib/constants.ts`](lib/constants.ts)):

| الأداة | متغير البيئة | ملاحظة |
|--------|----------------|--------|
| **Google Analytics 4** | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `@next/third-parties/google` — عطّل بقيمة فارغة |
| **Microsoft Clarity** | `NEXT_PUBLIC_CLARITY_PROJECT_ID` | تسجيل جلسات وخرائط حرارة — عطّل بقيمة فارغة |

---

## 7. Developer features (implementation quick scan)

- **Prefetching** — `usePrefetchProduct` (cards / PDP) and `usePrefetchProducts` (e.g. category rails) for snappier navigation.
- **Cart** — Add / remove / clear; totals guarded until Zustand rehydrates (`useHasHydrated`).
- **Checkout & orders** — Feature services + `/app/api/*` routes toward WooCommerce.
- **Reviews** — Create flow with TanStack Query optimistic updates (`onMutate`).
- **Security headers** — Baseline in `next.config.ts` (`X-Frame-Options`, `Referrer-Policy`, …).
- **Images** — `remotePatterns` in `next.config.ts` + shared `AppImage` + fallbacks.
- **Webhooks** — WooCommerce webhook handler for revalidation (see `.env.local.example`).
- **E2E** — Playwright (`npm run test:e2e`, `test:e2e:audit` for a focused audit spec).

---

## Further reading (المستندات)

| Document | Purpose |
|----------|---------|
| [`docs/project-vision.md`](docs/project-vision.md) | Brand/SEO intent, mobile-first principles, roadmap ideas |
| [`docs/platform-features-ar.md`](docs/platform-features-ar.md) | Arabic overview: storefront + CMS + control panel + web push (FCM) |
| [`docs/firebase-web-push-vapid.md`](docs/firebase-web-push-vapid.md) | VAPID key setup for web push in Firebase |
| [`docs/tech-audit.md`](docs/tech-audit.md) | Layout shift (CLS), mobile commerce chrome, search/menu UX notes |
| [`AGENTS.md`](AGENTS.md) | Agent / contributor notes (Next.js docs pointer, branding & SEO doc links) |

---

## Folder structure

There is **no `/src` wrapper** — top-level folders map directly to the app:

```text
app/            # Routes, layouts, manifest, SEO routes, internal API (incl. pwa-sw, control, webhooks)
components/     # Shared UI, layout shell, route-level page assembly under components/pages
features/       # Domain modules (products, cart, checkout, auth, cms, control, …)
hooks/          # Cross-cutting hooks (catalog, auth session, hydration, network, …)
lib/            # API helpers, Woo client, control auth, cache tags
providers/      # React Query, toasts
public/         # Static assets (icons, placeholders, …)
schemas/        # Zod — WordPress/Woo shapes, CMS payloads
```

**Data flow:** UI → hooks → `features/*/services` → `/app/api/*` → WooCommerce REST.

---

## Optional: make the repo “pop”

1. **Screenshots** — Add `docs/screenshots/` (home, PLP, PDP, cart) and link them here.
2. **Live demo** — Deploy to Vercel and add: `**Demo:** https://your-demo.vercel.app`
3. **Lighthouse / GIF** — A short GIF of navigation + prefetch feels instant for visitors.

---

## Contributing

Contributions are welcome. For **larger** changes, open an issue first to align on scope. Keep PRs focused: match existing patterns (services + Zod at boundaries, no secrets in `NEXT_PUBLIC_`).

---

## License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE).

---

Built as a **headless commerce** reference you can fork for your own brand, wiring your WooCommerce base URL and keys.
