<<<<<<< HEAD
# 🛒 E-Commerce Frontend (Next.js + WooCommerce)

Production-grade e-commerce frontend built with Next.js using a scalable feature-based architecture.
Backend is powered by WordPress + WooCommerce (Headless).

---

## 🚀 Tech Stack

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* Zustand (State Management)
* React Query (Data Fetching & Caching)
* Axios
* Zod (Validation)

---

## 🧠 Architecture Overview

This project follows a **feature-based architecture**:

/features → business logic (products, cart, etc.)
/components → reusable UI
/app → routing (pages)
/lib → API layer
/hooks → shared hooks

---

## 🔄 Data Flow

UI → Hooks → Services → API Route → WooCommerce API

---

## 🎯 Data Source Strategy (IMPORTANT)

The project supports switching between:

* Mock Data (for development)
* Real WooCommerce API

### Controlled by environment variable:

NEXT_PUBLIC_USE_MOCK=true

---

### Behavior:

* If true → uses mock data
* If false → calls internal API

👉 No UI changes required

---

## 🔌 API Integration

We use internal API routes:

/app/api/*

### Why?

* Hide WooCommerce API keys
* Secure requests
* Centralize logic

---

## 🔐 Environment Variables

Create `.env.local`:

NEXT_PUBLIC_API_URL=https://yourstore.com
WC_CONSUMER_KEY=ck_xxxxx
WC_CONSUMER_SECRET=cs_xxxxx
NEXT_PUBLIC_USE_MOCK=true

---

## 🛒 Cart System

* Built with Zustand
* Persisted in localStorage
* Supports:

  * Add to cart
  * Remove item
  * Clear cart

---

## 🖼️ Image System

* Static images → /public/images
* Product images → WooCommerce API
* Fallback image included

---

## 🧩 Folder Structure

/app
/features
/components
/lib
/hooks
/types

---

## 🚀 Getting Started

### 1. Install dependencies

npm install

---

### 2. Run development server

npm run dev

---

### 3. Open

http://localhost:3000

---

## 🌳 Branching Strategy

* main → Production
* develop → Integration
* feature/* → Features
* fix/* → Bugs
* hotfix/* → Urgent fixes

---

## 🔁 Workflow

1. Create branch from develop
2. Work on feature
3. Push branch
4. Create Pull Request
5. Review → Merge

---

## 🧠 Code Rules

* No API calls inside components
* Use hooks + services
* Keep UI separate from logic
* Use TypeScript strictly

---

## 🧪 Validation

* Use Zod for:

  * API responses
  * Forms

---

## ⚠️ Security

* Never expose API keys in frontend
* Always use internal API routes

---

## 🎯 Goal

Build a scalable, maintainable, and production-ready frontend that integrates seamlessly with WooCommerce.

---

## 🤝 Contributing

Please check CONTRIBUTING.md before contributing.

---

## 🚀 Future Plans

* WooCommerce full integration
* AI automation
* Admin dashboard
* Order management system

---

Built with ❤️
=======
# Sokany Store — Professional Headless E-commerce Starter

### Next.js 16 · React 19 · Headless WooCommerce · TanStack Query · Zod · Zustand

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
| **PWA-ready** | `app/manifest.ts` provides install metadata, icons, RTL, and theme colors. |
| **SEO** | JSON-LD helpers, sitemap, robots — oriented toward real product pages. |

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
| **WordPress + WooCommerce** | Headless backend via **WooCommerce REST API** |

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

See `.env.local.example` for the full list (currency, locale, branding, webhooks, hotline, etc.).

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build && npm run start   # production locally
npm run lint                     # ESLint
```

---

## 4. Storefront features (ميزات الواجهة)

**تجربة المستخدم:** واجهة **عربية RTL**، عملة ومحلية قابلة للضبط من البيئة، وتركيز على **الموبايل أولاً** — انظر [رؤية المشروع](docs/project-vision.md).

| المسار / النطاق | ماذا يقدّم |
|-----------------|------------|
| **الرئيسية `/`** | شرائح فئات، عروض، شرائط ثقة، عدّ تنازلي لعروض محدودة |
| **الكتالوج** `/products`، `/categories`، `/categories/[slug]` | شبكة منتجات، تصفية وترتيب، اختصارات تصنيفات |
| **المنتج** `/products/[id]` | معرض صور، مواصفات، مراجعات، إضافة للسلة |
| **البحث** `/search` | بحث في المنتجات ضمن تدفق المتجر |
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
| **PWA + FCM** | Service worker يولَّد من `/api/pwa-sw` — offline، وإشعارات خلفية عند تفعيل Firebase Messaging. |

شرح عربي مُكمل: [`docs/platform-features-ar.md`](docs/platform-features-ar.md).

---

## 5. Mobile shell & UX

- **كروم تجاري سفلي ثابت** — ملخص سلة + شريط تنقل سفلي في طبقة `fixed` واحدة؛ ارتفاع الكروم يُزامَن مع متغيّرات CSS حتى يبقى حشو المحتوى متسقًا (تفاصيل في [`docs/tech-audit.md`](docs/tech-audit.md)).
- **أدراج (Drawers)** — سلة، أمنيات، وفلاتر الكتالوج كطبقات بدل قفزات ثقيلة بين الصفحات حيث يناسب المنتج.
- **PWA** — [`app/manifest.ts`](app/manifest.ts) للتثبيت وألوان السمة واتجاه RTL.

---

## 6. Analytics & monitoring (optional)

يُحمَّل من [`app/layout.tsx`](app/layout.tsx) عندما تكون المعرفات **غير فارغة** (المصدر: [`lib/constants.ts`](lib/constants.ts)):

| الأداة | متغير البيئة | ملاحظة |
|--------|----------------|--------|
| **Google Analytics 4** | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `@next/third-parties/google` — عطّل بقيمة فارغة |
| **Microsoft Clarity** | `NEXT_PUBLIC_CLARITY_PROJECT_ID` | تسجيل جلسات وخرائط حرارة — عطّل بقيمة فارغة |

---

## 7. Developer features (implementation quick scan)

- **Prefetching** — Hooks like `usePrefetchProduct` for snappier navigation to PDP.
- **Cart** — Add / remove / clear; totals guarded until Zustand rehydrates (`useHasHydrated`).
- **Checkout & orders** — Feature services + `/app/api/*` routes toward WooCommerce.
- **Reviews** — Create flow with TanStack Query optimistic updates (`onMutate`).
- **Security headers** — Baseline in `next.config.ts` (`X-Frame-Options`, `Referrer-Policy`, …).
- **Images** — `remotePatterns` in `next.config.ts` + shared `AppImage` + fallbacks.
- **Webhooks** — WooCommerce webhook handler for revalidation (see `.env.local.example`).

---

## Further reading (المستندات)

| Document | Purpose |
|----------|---------|
| [`docs/project-vision.md`](docs/project-vision.md) | Brand/SEO intent, mobile-first principles, roadmap ideas |
| [`docs/platform-features-ar.md`](docs/platform-features-ar.md) | Arabic overview: storefront + CMS + control panel + web push (FCM) |
| [`docs/firebase-web-push-vapid.md`](docs/firebase-web-push-vapid.md) | VAPID key setup for web push in Firebase |
| [`docs/tech-audit.md`](docs/tech-audit.md) | Layout shift (CLS), mobile commerce chrome, search/menu UX notes |

---

## Folder structure

There is **no `/src` wrapper** — top-level folders map directly to the app:

```text
app/            # Routes, layouts, manifest, SEO routes, internal API
components/     # Shared UI, layout shell, pages assembly
features/       # Domain modules (products, cart, checkout, auth, reviews, …)
hooks/          # Cross-cutting hooks (cart, auth session, hydration, …)
lib/            # API helpers, Woo client, site URL utilities
providers/      # React Query, toasts
public/         # Static assets (icons, placeholders, …)
schemas/        # Shared Zod / WordPress-oriented schemas where used
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
>>>>>>> origin/main
