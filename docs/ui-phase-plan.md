# UI Phase Plan

This audit is scoped to production-safe storefront polish. It preserves the current Sokany identity, WooCommerce integration, App Router routing, SEO structure, RTL behavior, and mobile-first storefront architecture.

## 1. Current UI Strengths

- WooCommerce is protected behind same-origin BFF route handlers; storefront UI does not expose Woo secrets.
- Arabic-first RTL is already reflected in labels, page comments, layout choices, and checkout/cart flows.
- Product grids already use lazy query gates, first-image priority slots, and optional virtualization for long lists.
- Image rendering is centralized through `components/AppImage.tsx`, including Woo image handling and placeholders.
- Mobile commerce chrome is intentional: bottom navigation, cart peek, reserved bottom padding, and toast offsets already work from shared concepts.
- Accessibility foundations are present: focus traps, skip-main support, `aria` labels, reduced-motion paths, and mobile touch targets.
- Motion and surface tokens exist in `lib/motion.ts` and `app/globals.css`, giving future tuning a stable base.

## 2. Current UX Problems

- Product cards carry many competing signals in a small area: sale/status, video, trust badge, rating, warranty copy, wishlist, image motion, cart CTA, and sometimes quick view.
- Primary CTAs drift visually because some surfaces use shared buttons while cart peeks, docks, and card CTAs use local raw button classes.
- Loading states do not always match the final layout, especially on product detail pages.
- Homepage/category/cart/checkout spacing is mostly good, but the rhythm varies enough to feel like separate systems.
- Cart and checkout purchase actions are clear, but the CTA copy and pill styling are duplicated across mobile surfaces.

## 3. Mobile UX Issues

- The five-item bottom navigation is reachable by thumb, but visually dense on narrow phones.
- Active bottom-nav styling competes with stronger purchase CTAs.
- Fixed mobile surfaces can stack: bottom nav, cart peek, PDP sticky cart, floating actions, toasts, and PWA prompts.
- Product-card image interaction overlays can add tap/scroll friction on dense mobile grids.
- Checkout works on mobile, but summary-first ordering should be validated with real users before changing it.

## 4. Performance-Heavy UI Areas

- `features/products/components/ProductCard.tsx` is the hottest UI component and includes state, layout effects, pointer handlers, image crossfade, wishlist effects, cart animation, badges, and quick-view wiring.
- `features/products/components/ProductGallery.tsx` pulls in lightbox/zoom behavior through `product-gallery-lightbox.tsx`; this is acceptable for PDP, but is a Phase 2 dynamic-loading candidate.
- Framer Motion is localized, but it appears in mobile cart, mobile nav, reveal, and PDP gallery paths.
- Backdrop blur, view transitions, shimmers, fixed chrome, and the lime atmosphere can add GPU cost on Safari/WebView.
- Homepage loading is staged well, but still composes many dynamic sections and product grids.

## 5. ProductCard Problems

- `ProductCard` is a large client component combining layout variants, media behavior, prefetch, badges, cart CTA, wishlist slot, and quick view.
- Variant layout strings duplicate similar spacing and typography choices.
- The card CTA carries custom inline styling instead of a small internal class contract.
- Mobile cards can feel noisy because every badge and metadata line has strong visual weight.
- Per-card image crossfade and pointer state should stay restrained in dense grids.

## 6. Toast Problems

- Toast styling is centralized in `providers/ToastProvider.tsx`, but call-site behavior is inconsistent.
- Cart and wishlist toasts include full product names in titles, which can create noisy long Arabic notifications.
- Repeated add/remove actions can stack duplicate toasts.
- Storefront toast semantics vary between `message`, `info`, `success`, and `error`.
- Mobile toast offset correctly uses commerce chrome height, but other fixed surfaces still need care.

## 7. Skeleton/Loading Inconsistencies

- `ProductSkeleton` is catalog-shaped but is reused where final UI differs.
- Product/image placeholders use shimmer while the generic `Skeleton` primitive uses pulse.
- PDP review skeletons are bespoke and duplicated.
- Homepage rail placeholders reserve space efficiently, but look different from final product cards.

## 8. Spacing/Token Inconsistencies

- Useful tokens exist for product type, semantic color, surfaces, motion, and mobile chrome height, but adoption is uneven.
- Mobile purchase CTAs repeat similar arbitrary classes in the cart peek, cart dock, drawer footer, and PDP sticky cart.
- Radii vary locally between `rounded-lg`, `rounded-xl`, `rounded-2xl`, and `rounded-3xl`.
- Product grid gaps are consistent, but wrapper spacing around grids varies by page.
- Brand lime is used for identity, active navigation, badges, and CTAs; hierarchy improves when lime is used more selectively.

## 9. Safari/WebView Risks

- Fixed bottom chrome plus `dvh`/`svh`, safe-area padding, backdrop blur, and body scroll locking is the main mobile-browser risk cluster.
- `ResizeObserver` updates mobile commerce CSS variables; necessary, but height changes can still affect perceived layout stability.
- Existing WebKit hysteresis in the scroll-collapse controller should be preserved.
- Quick view, nav drawer, and gallery/lightbox all lock body scroll; nested modal behavior needs iOS smoke testing.
- Backdrop blur should not be expanded casually because it can be expensive in WebViews.
- Raw `<img>` is acceptable inside the zoom lightbox, but should stay isolated there.

## 10. High-Impact Low-Risk Improvements

- Calm product cards by reducing competing emphasis and centralizing repeated CTA/badge classes.
- Make cart/wishlist toasts shorter, consistent, and deduplicated by stable IDs.
- Use a PDP-shaped loading state instead of a catalog card for PDP pending state.
- Normalize mobile cart checkout pill classes and CTA copy.
- Soften bottom-nav active styling while preserving labels, routes, drawer behavior, and tap targets.
- Keep token cleanup local to touched files.

## 11. Risky Changes To Avoid

- Do not redesign homepage, category grid, PDP, cart, or checkout.
- Do not move folders, rename files, or introduce new architecture.
- Do not change WooCommerce APIs, payloads, caching, SEO, JSON-LD, or routing.
- Do not remove the mobile commerce chrome height reservation model.
- Do not remove Framer Motion globally in this phase.
- Do not introduce new UI, carousel, toast, or image libraries.
- Do not change PWA service worker fetch behavior as part of UI polish.
- Do not globally change Button or Card primitives without a wider audit.

## 12. Recommended Phased Roadmap

### Phase 1: Safe High-Impact Polish Only

Scope:

- `features/products/components/ProductCard.tsx`
- `features/products/components/ProductSkeleton.tsx`
- `features/products/components/product-carousel-row.tsx`
- `components/pages/ProductDetailPageContent.tsx`
- `hooks/useCart.ts`
- `hooks/useWishlist.ts`
- `providers/ToastProvider.tsx`
- `components/layout/bottom-nav.tsx`
- `features/cart/components/MobileCartBottomSheet.tsx`
- `features/cart/components/cart-mobile-checkout-dock.tsx`
- `features/cart/components/cart-drawer-body.tsx`

Safe changes:

- Extract small internal class constants for repeated product-card CTA and badge styles.
- Slightly reduce metadata/badge emphasis on compact product cards.
- Align product skeleton dimensions with compact card CTA/image wells.
- Replace PDP generic card loading with a PDP-shaped placeholder.
- Shorten cart/wishlist toast titles, move product names into descriptions, and use stable toast IDs.
- Soften active bottom-nav treatment.
- Normalize mobile cart checkout pill copy and shared classes.

Risks:

- ProductCard edits are low to medium risk because the component appears across many grids.
- Toast edits are low risk if store behavior stays unchanged.
- Skeleton edits are low risk if final loaded layout dimensions are not changed.
- Bottom-nav visual tuning is low risk but subjective.
- Fixed cart CTA surfaces require mobile viewport checks.

Expected improvements:

- Product grids feel calmer without losing Sokany identity.
- Repeated add/remove actions no longer spam stacked toasts.
- PDP loading better matches the final page.
- Mobile purchase actions keep visual priority over navigation decoration.
- Cart and checkout feel more cohesive.

### Phase 2: Performance/UI Balance

- Split or lazy-load expensive `ProductCard` internals only after profiling.
- Consider dynamic-loading PDP zoom/lightbox behavior.
- Audit Framer Motion usage for simple CSS alternatives.
- Reduce per-image shimmer/state in dense grids if profiling shows pressure.
- Use build analysis and mobile WebKit checks before and after.

### Phase 3: Advanced UX Polish

- Refine mobile navigation hierarchy after observing behavior.
- Tune PWA prompts so they never compete with checkout/cart actions.
- Improve checkout UX without changing Woo order payloads.
- Tune global motion using the existing motion contract.
- Consider richer product media only after performance is measured.

## Phase 1 Implementation Guardrails

Phase 1 must stay visual and feedback-focused. It must not alter APIs, WooCommerce integration, routing, SEO structure, persisted cart shape, checkout payloads, folder layout, or the current storefront identity.
