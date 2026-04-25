# Part 3: Page Assembly

Paste the prompt below into Cursor after Parts 1 and 2 are complete.

```text
Continue from the Sokany project after the shared foundation and feature components are already implemented.

Goal:
Assemble the actual pages from the approved Stitch design using the shared and feature components that now exist. Do not implement pages as unique one-off mockups. Compose them from reusable components and preserve current logic integrations.

Important constraints:
- Reuse the new shared and feature components.
- Keep Arabic RTL as the UI default.
- Support mobile and desktop page behavior.
- Do not regress existing route behavior.
- Keep the current business logic unless a page absolutely cannot render without a safe adapter layer.
- If an existing page is logically broken, fix only what is necessary to make the new UI assembly work safely.

Target routes to build or refactor:
- app/page.tsx
- app/products/page.tsx
- app/products/[id]/page.tsx
- app/categories/page.tsx
- app/categories/[slug]/page.tsx
- app/checkout/page.tsx
- app/about/page.tsx
- app/service-centers/page.tsx
- app/cart/page.tsx (only if needed for consistency with cart summary surfaces)

Page assembly requirements:

1. Home page
- Build mobile and desktop sections from:
  - top header
  - mobile shortcut categories or category scroller
  - search field
  - promo banner / hero
  - featured products section
  - best sellers or catalog teaser section
  - bottom nav on mobile
  - floating cart summary on mobile when cart has items
- Preserve current product/category hooks where possible

2. Category listing page
- Mobile:
  - compact header
  - search
  - filter pills
  - product grid
  - bottom nav
- Desktop:
  - top header
  - sidebar category/filter area
  - section header
  - product grid
- Keep category loading/error/empty states

3. Product details page
- Mobile:
  - top header
  - product gallery
  - product info panel
  - quantity and CTA
  - optional related products section
  - bottom nav
- Desktop:
  - large gallery + info panel split layout
  - specs/highlights area
  - related products section
- Preserve SEO metadata and structured data, but make them safe and compatible with current Next.js lint/build rules

4. Checkout page
- Mobile:
  - compact summary + form sections
- Desktop:
  - split layout with checkout form and summary panel
- Use CheckoutShippingForm, CheckoutPaymentForm, and CheckoutSummary
- Keep current stubbed purchase flow but make the page visually production-like

5. About Us page
- Build from:
  - page hero
  - story block
  - feature/trust blocks
  - footer
- Match Stitch tone: clean, premium, trustworthy

6. Service Centers page
- Build from:
  - page hero or page intro
  - search field
  - service center cards/list
  - footer
- Prepare for eventual real data, but keep component APIs clean

7. Cart integration behavior
- Reuse cart summary components where appropriate
- Mobile floating cart summary should be visible only when cart has items
- Do not duplicate cart total UIs across pages if a shared summary component can handle them

Implementation notes:
- Create any minimal mock or local page data required for About or Service Centers in a way that can later be replaced cleanly.
- If needed, create small feature-level data files for About and Service Centers rather than hardcoding large copy blocks inline in route files.
- Keep pages slim; page files should mostly assemble components and pass data.
- Extract page sections if a route starts getting too long.

Acceptance criteria:
- All target pages render using the new design system.
- Mobile and desktop layouts both match the Stitch direction closely.
- Page code is composed from reusable pieces, not repeated blocks.
- Existing logic is preserved as much as possible.
- Build and lint issues introduced by the UI work are resolved.
- `npm run build` succeeds.

Deliver a final summary with:
- pages updated
- new supporting files
- any remaining logic blockers that need separate follow-up work
```
