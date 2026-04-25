import type { Product } from "@/features/products/types";

/** Short badge label for the PDP gallery (matches storefront hero badges). */
export function getProductGalleryBadge(product: Product): string | null {
  const slugHit = product.tags.some(
    (t) =>
      t.slug === "new-tech" ||
      t.slug.includes("new-tech") ||
      /new.?tech/i.test(t.slug),
  );
  if (slugHit) return "NEW TECH";

  const nameHit = product.tags.some((t) =>
    /تقنية|tech|new/i.test(t.name),
  );
  if (nameHit) return "NEW TECH";

  if (product.featured) return "مميز";

  return null;
}
