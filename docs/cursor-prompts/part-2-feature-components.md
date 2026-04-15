# Part 2: Feature Components

Paste the prompt below into Cursor after finishing Part 1.

```text
Continue from the existing Sokany project after the shared foundation work is complete.

Goal:
Build the feature-level UI components required by the approved Stitch design. These components must compose from the shared UI and layout primitives already created in Part 1. Do not duplicate primitive styling in feature files.

Important constraints:
- Reuse shared primitives first.
- Keep business logic in features and shared visuals in components/ui or components/layout.
- Preserve existing stores, hooks, and services.
- Do not silently remove current data fetching behavior.
- Arabic RTL is the default visual direction.
- Mobile and desktop variants are both required where relevant.

Files to create or update:
- features/products/components/product-card.tsx
- features/products/components/product-grid.tsx
- features/products/components/product-gallery.tsx
- features/products/components/product-info-panel.tsx
- features/products/components/product-specs-list.tsx
- features/categories/components/category-shortcut-grid.tsx
- features/categories/components/category-scroller.tsx
- features/categories/components/category-sidebar.tsx
- features/cart/components/cart-summary-bar.tsx
- features/cart/components/cart-summary-panel.tsx
- features/checkout/components/checkout-summary.tsx
- features/checkout/components/checkout-shipping-form.tsx
- features/checkout/components/checkout-payment-form.tsx
- features/service-centers/components/service-center-card.tsx
- features/service-centers/components/service-center-search.tsx
- features/about/components/about-story-block.tsx
- features/about/components/about-feature-block.tsx

Component requirements:

1. ProductCard
- Use shared Card, Badge, Button, and PriceText primitives
- Must support:
  - image
  - title
  - short label/tag
  - price and optional old price
  - optional add-to-cart action
  - optional wishlist/favorite icon slot
  - sale/new badge state
- Variants: mobile compact, desktop catalog, featured

2. ProductGrid
- Responsive grid wrapper
- Supports loading, empty, and populated states
- Should accept render or action hooks without hardcoding data logic

3. ProductGallery
- Main product image
- Thumbnail strip
- Mobile and desktop layout behavior
- Must work with current product image data shape

4. ProductInfoPanel
- Title, SKU/tag, availability, price block, short description
- Add-to-cart CTA area
- Optional quantity control
- Desktop hierarchy should feel premium and clean

5. ProductSpecsList
- Simple list/grid for spec highlights
- Shared visual rhythm with product info panel

6. CategoryShortcutGrid
- Mobile home shortcut tiles visible near top of page
- Icon/image + short label
- Used for fast category access

7. CategoryScroller
- Horizontal category list for mobile
- Optional compact card variant

8. CategorySidebar
- Desktop category/filter navigation
- Highlight active category
- Can support future filters without redesign

9. CartSummaryBar
- Mobile floating cart summary above bottom nav
- Shows count, quantity summary, total, and CTA
- Should only be a UI component; parent decides when to show it

10. CartSummaryPanel
- Desktop order/cart summary block
- Used in checkout and maybe cart page
- Shows line items summary, subtotal, shipping label, and total

11. CheckoutSummary
- Shared order summary surface for checkout screens
- Structured rows, totals, and item previews

12. CheckoutShippingForm
- Uses shared FormField and SelectField
- Should mirror the current checkout data model where practical
- Needs clear sections and validation-ready structure

13. CheckoutPaymentForm
- Payment and shipping method selection surface
- Uses shared controls
- Prepare for the current stub logic without pretending payment is fully implemented

14. ServiceCenterCard
- Branch name, city, address, actions
- Mobile and desktop friendly
- Actions: map/location CTA and contact CTA slot

15. ServiceCenterSearch
- Search field + optional filter actions
- Reuses shared SearchField

16. AboutStoryBlock
- Brand story / copy-first content block
- Supports title, paragraphs, and optional media

17. AboutFeatureBlock
- Reusable row or card set for trust pillars, quality promises, and support guarantees

Integration rules:
- Product components should work with existing normalized product types whenever possible.
- Cart components should integrate with current cart store shape.
- Checkout components should stay compatible with the current checkout schema even if the underlying payload mapping still needs separate logic fixes.
- Do not hardcode mock values inside components unless they are explicitly placeholder props.

Design behavior notes from Stitch:
- Mobile surfaces are compact and commerce-first.
- Desktop surfaces are more spacious and structured.
- Large hero areas appear mainly on desktop or informational pages.
- Black/white/gray base with lime CTA emphasis only.
- Product imagery should remain visually dominant where intended.

Acceptance criteria:
- Each feature component is isolated and reusable.
- Shared primitives from Part 1 are used consistently.
- Components support empty/loading/populated states where relevant.
- Components are typed with clear props.
- No page-level duplication of the same commerce UI patterns.
- `npm run build` succeeds.

When done:
- Summarize each feature component and its props contract.
- List any places where existing logic shape blocked ideal UI composition.
```
