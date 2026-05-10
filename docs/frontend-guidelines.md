# Frontend guidelines — Sokany Store

## العربية

المتجر **عربي أولاً (RTL)**. المكوّنات تبقى قريبة من العرض فقط؛ المنطق الأثقل يعيش في **خطافات** (`hooks/`, `features/*/hooks/`) أو **خدمات** (`features/*/services/`). استخدم **TanStack Query** لقراءة/كتابة حالة السيرفر، و**Zustand** للحالة المحلية مع **انتظار إعادة التعبئة** بعد `persist` عبر [`useHasHydrated`](../hooks/useHasHydrated.ts) لتفادي اختلاف SSR/عميل. عند الحدود مع الـ API: **Zod** (`parse` / `safeParse`) قبل أن تصل البيانات للواجهة.

**تعليقات تخطيط الصفحات:** لأي صفحة متجر جديدة أو معدّلة بشكل كبير، أضف تعليقات `/* … */` بالعربية على مستوى الملف والأقسام الرئيسية توضح ما يراه المستخدم والـ breakpoints — انظر [`.cursorrules`](../.cursorrules) §7.

**صيانة:** راجع [`docs/tech-audit.md`](tech-audit.md) لملاحظات CLS والكروم السفلي على الموبايل قبل تغييرات كبيرة على `mobile-commerce-chrome` أو `site-shell`.

---

## English — Server vs client

- Prefer **Server Components** for static SEO shells, layouts, and data that can be fetched on the server.
- Mark interactive surfaces with `"use client"`; keep them under server-driven layouts when possible.
- Route **metadata:** `generateMetadata` / `export const metadata` in `app/**/page.tsx` and layouts — see [`docs/seo-system.md`](seo-system.md).

---

## English — Data & state

| Concern | Pattern |
|---------|---------|
| GET-style server data | `useQuery` in client trees |
| Mutations | `useMutation` (e.g. reviews optimistic `onMutate`) |
| Prefetch | `queryClient.prefetchQuery` on intentional triggers (e.g. product link hover) |
| Cart / persisted client state | Zustand + `persist`; guard reads with `useHasHydrated` |
| API shape safety | Zod in `schemas/` or feature services — parse at HTTP boundary |

---

## English — Images

Use `next/image` via the shared **`AppImage`** wrapper (or equivalent constraints). Avoid raw `<img>` in TSX. Remote hosts: [`next.config.ts`](../next.config.ts) `images.remotePatterns`. Designer-facing sizes: [`docs/image-specs.md`](image-specs.md), [`docs/design-image-sizes-ar.md`](design-image-sizes-ar.md).

---

## English — Loading & UX

- Provide skeletons or explicit loading UI for visible `useQuery` pending states.
- Mobile shell: bottom commerce chrome, drawers — see [`components/layout/mobile-commerce-chrome.tsx`](../components/layout/mobile-commerce-chrome.tsx), [`components/layout/site-shell.tsx`](../components/layout/site-shell.tsx); CLS notes in [`docs/tech-audit.md`](tech-audit.md).

---

## English — Representative files for layout comments

Examples of route-level assembly and section structure:

- `components/pages/*PageContent.tsx` — storefront page bodies
- Feature UI under `features/<domain>/components/`

---

## Related

- [`docs/architecture.md`](architecture.md)
- [`docs/image-specs.md`](image-specs.md)
- [`.cursorrules`](../.cursorrules) — project conventions
