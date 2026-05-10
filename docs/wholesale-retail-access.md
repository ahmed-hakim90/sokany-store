# Wholesale vs retail access — decision spec

## Goal

Separate **wholesale (جملة)** and **retail (تجزئة)** experiences: pricing files, URLs, visibility rules, no cross-navigation between segments, and optional **PWA per segment** (`start_url`, manifest name).

## Data model options (pick one before build)

1. **Single Woo store + B2B plugin / role meta** — customer role or meta drives price tier; storefront reads tier from session.
2. **Dual price meta** — custom fields `wholesale_price` / `retail_price` on products; UI picks column by segment.
3. **Two catalogs** — duplicate or partitioned products (high maintenance).

## Routing

- Path prefix (e.g. `/wholesale`) or **subdomain**; middleware or layout guard sets segment cookie/header.
- **Navigation policy:** retail layout hides wholesale links and vice versa; deep links to wrong segment → redirect or 404.

## Auth

- Map Firebase / Woo customer to segment; gate `/api/*` cart/checkout transforms if needed.

## PWA

- Dynamic manifest route or two static manifests; `theme_color` / `name` per segment; `start_url` includes segment base.

## Next steps

1. Stakeholder choice on Woo model (plugin vs meta vs split catalog).
2. Add segment to analytics and SEO (`robots` / `noindex` for wholesale if private).
