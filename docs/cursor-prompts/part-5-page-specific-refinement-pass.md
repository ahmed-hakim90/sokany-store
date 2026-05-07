# Part 5: Page-Specific Refinement Pass

Paste the prompt below into Cursor after Parts 1-4 are already in place.

```text
Continue from the current Sokany implementation. The architecture and base components already exist.

Goal:
Refine specific pages so they match the approved reference screens more closely without replacing the current shared-component architecture.

Critical rule:
Do not rewrite the system. Refine page composition and section structure using the existing shared and feature components, extending them only when a page-specific section clearly deserves its own reusable block.

Pages to refine:
- Home
- About Us
- Service Centers
- Checkout

Global constraints:
- Arabic RTL is the default.
- Preserve logic and routes.
- Reuse shared primitives and feature components first.
- If a new section component is needed, create it as a small reusable block rather than embedding large JSX directly in the page.

Home page refinement requirements:
- Match the reference order and density more closely:
  - minimal top header
  - search bar
  - compact category shortcuts or scroller
  - hero promo card with overlay text and CTA
  - compact trust strip
  - bestseller section
  - dark secondary promo card
  - mobile bottom nav
- Product cards on home should feel lighter and cleaner than heavy catalog cards.
- The hero promo should feel compact and not consume the whole page.

About Us refinement requirements:
- Build the page around the reference storytelling flow:
  - large hero image with overlay text
  - trust / quality block
  - strong numeric/stat emphasis block
  - dark visual media card
  - feature/value block
  - services / after-sales support block
  - quote/testimonial style section
  - bottom nav on mobile
- The page should feel premium, calm, and trust-building.
- Avoid making About feel like a generic text document.

Service Centers refinement requirements:
- Match the reference structure:
  - intro hero/title block
  - location search / branch finder CTA row
  - featured branch card near the top
  - list of branch cards with city, branch name, short description, and directions CTA
  - emergency help or urgent support CTA block near the bottom
  - bottom nav on mobile
- Cards should be easy to scan and lightly elevated.

Checkout refinement requirements:
- Match the reference layout and section order:
  - order summary card with product rows
  - coupon row
  - reassurance/info note
  - shipping details card
  - payment method card group
  - legal/privacy note
  - strong final confirm CTA
  - support/reassurance blocks near the bottom
- Payment options should feel like selectable cards, not plain stacked form controls.
- Preserve the current checkout logic, but improve presentation to match the reference screens.

Allowed file changes:
- app/page.tsx
- app/about/page.tsx
- app/service-centers/page.tsx
- app/checkout/page.tsx
- page section files created in components/pages or features/*
- minor extensions to shared/feature component props if needed for better composition

Suggested new reusable section components if helpful:
- features/home/components/home-hero-banner.tsx
- features/home/components/home-trust-strip.tsx
- features/home/components/home-promo-card.tsx
- features/about/components/about-lime-stat-ribbon.tsx
- features/about/components/about-quote-block.tsx
- features/service-centers/components/featured-service-center-card.tsx
- features/checkout/components/checkout-coupon-row.tsx
- features/checkout/components/checkout-reassurance-note.tsx
- features/checkout/components/payment-option-card.tsx

Acceptance criteria:
- These four pages are visually closer to the reference screens.
- The pages feel purpose-built rather than generic.
- Shared architecture remains intact.
- New section components are reusable and well-scoped.
- `npm run build` succeeds.

Deliver a summary with:
- which pages were refined
- which new section components were introduced
- any remaining visual gaps versus the references
```
