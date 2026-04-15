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

See `.env.local.example` for the full list (currency, locale, branding, etc.).

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

## Key features (quick scan)

- **Prefetching** — Product hooks support prefetch patterns for snappier navigation.
- **Cart** — Add / remove / clear; totals guarded until Zustand rehydrates.
- **Checkout & orders** — Wired through feature services and API routes toward WooCommerce.
- **Reviews** — Create flow with optimistic list updates.
- **Security headers** — Baseline headers in `next.config.ts` (`X-Frame-Options`, `Referrer-Policy`, …).
- **Images** — `next.config.ts` `remotePatterns` + shared `AppImage` + fallbacks.

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
