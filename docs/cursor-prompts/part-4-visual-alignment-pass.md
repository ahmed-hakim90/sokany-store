# Part 4: Visual Alignment Pass

Paste the prompt below into Cursor only after Parts 1-3 have already been implemented.

```text
Continue from the implementation already created from Parts 1-3.

Goal:
Run a visual alignment pass so the existing implementation matches the approved Sokany reference screens more closely. This is not a rebuild. Do not replace the architecture, shared components, or feature boundaries unless a very small refactor is required to improve consistency.

Primary rule:
Treat the provided reference screens as the visual source of truth for spacing, hierarchy, UI density, section rhythm, and emphasis.

Important constraints:
- Do not rewrite the app from scratch.
- Do not replace shared components with page-specific duplicates.
- Preserve the current component architecture.
- Preserve existing logic, hooks, stores, and route structure.
- This pass is mainly about composition, spacing, styling refinement, and section tuning.
- Keep Arabic RTL as the default direction.
- Keep the Sokany visual identity:
  - Accent lime: #DAFF00
  - Black: #000000
  - Gray 1: #AFB7B9
  - Gray 2: #D4D4D4
  - Dark gray: #808080
  - White: #FFFFFF

Visual corrections to prioritize:

1. Surface hierarchy
- Main page background should feel like a very soft cool light gray/blue-tinted surface, not plain white everywhere.
- Cards should read clearly above the page background.
- White cards must have calm shadows and soft corners.

2. Lime usage
- Use lime as a precise highlight, not as a broad fill color.
- Prioritize lime for:
  - primary CTA buttons
  - active bottom nav item
  - badges
  - section emphasis pills
  - payment selection highlight
- Avoid oversaturating the interface with lime blocks unless the reference clearly does so.

3. Header refinement
- Mobile top bars should stay minimal and airy.
- Brand name should remain visually centered and clean.
- Action icons should feel light and not oversized.

4. Bottom navigation refinement
- Mobile bottom nav should feel grounded, soft, and premium.
- Active item should use a stronger visual emphasis similar to the reference.
- Do not make the bottom nav too tall or too icon-heavy.

5. Card density and spacing
- Reduce unnecessary empty space if the current UI feels too loose.
- Increase spacing if sections feel crowded.
- Match the reference rhythm: clean blocks separated by generous but controlled vertical spacing.

6. Product card proportions
- Ensure product imagery dominates.
- Price/title/action alignment should feel balanced.
- Promo badges should be compact and crisp.

7. Typography hierarchy
- Strong Arabic headings with confident weight.
- Secondary copy should be softer and lighter.
- Labels and metadata should remain readable but unobtrusive.

8. CTA styling
- Primary CTA should be lime with dark text where appropriate.
- Secondary CTA should be calm, neutral, and consistent.
- Avoid inconsistent button heights across related sections.

Files to inspect and refine as needed:
- app/globals.css
- app/layout.tsx
- components/layout/*
- components/ui/*
- features/products/components/*
- features/cart/components/*
- features/checkout/components/*
- features/about/components/*
- features/service-centers/components/*
- any page-level section files introduced in Part 3

Acceptance criteria:
- The existing UI looks materially closer to the approved screens.
- Section spacing, card feel, and hierarchy match the references better.
- No architectural regressions.
- Shared components remain shared.
- `npm run build` succeeds.

Deliver a concise summary:
- what visual areas were refined
- what was intentionally left unchanged
- whether any minor component API adjustments were necessary
```
