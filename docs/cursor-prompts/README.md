# Sokany Cursor Prompt Pack

This folder contains implementation-ready prompts you can paste into Cursor to build the new Sokany UI in controlled batches.

## Files

1. [part-1-foundation-and-shared-ui.md](/Users/hakimo/Documents/Projects/sokany-store/docs/cursor-prompts/part-1-foundation-and-shared-ui.md)
2. [part-2-feature-components.md](/Users/hakimo/Documents/Projects/sokany-store/docs/cursor-prompts/part-2-feature-components.md)
3. [part-3-page-assembly.md](/Users/hakimo/Documents/Projects/sokany-store/docs/cursor-prompts/part-3-page-assembly.md)
4. [part-4-visual-alignment-pass.md](/Users/hakimo/Documents/Projects/sokany-store/docs/cursor-prompts/part-4-visual-alignment-pass.md)
5. [part-5-page-specific-refinement-pass.md](/Users/hakimo/Documents/Projects/sokany-store/docs/cursor-prompts/part-5-page-specific-refinement-pass.md)

## How to use

1. Send Part 1 to Cursor first and let it finish.
2. Review generated shared primitives before moving on.
3. Send Part 2 to build domain-specific sections and commerce components.
4. Send Part 3 last to assemble pages from the shared layers.
5. If the result is structurally correct but not visually close enough to the reference screens, send Part 4.
6. Use Part 5 only after the main implementation is already in place and you want page-specific refinements without rewriting architecture.

## Global rules for Cursor

- Preserve existing business logic and data flow where possible.
- Do not replace feature logic with hardcoded visual-only stubs.
- Reuse existing stores, hooks, and services before introducing new ones.
- Prefer creating shared components instead of duplicating JSX.
- Keep Arabic `RTL` as the default UI direction.
- Support both mobile and desktop layouts.
- Keep the Sokany visual identity:
  - Accent: `#DAFF00`
  - Black: `#000000`
  - Gray: `#AFB7B9`
  - Light Gray: `#D4D4D4`
  - Dark Gray: `#808080`
  - White: `#FFFFFF`
- Use `Montserrat` as the UI font family if available in the project setup.
- Ensure `npm run build` still passes after each part.
