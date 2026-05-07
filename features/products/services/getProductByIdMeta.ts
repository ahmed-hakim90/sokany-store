import "server-only";
import { unstable_cache } from "next/cache";
import { USE_MOCK } from "@/lib/constants";
import { createWooClient } from "@/lib/create-woo-client";
import { mapProduct } from "@/features/products/adapters";
import { mockProducts } from "@/features/products/mock";
import { getSnapshotProducts } from "@/features/data-snapshot/server";
import { WOO_CACHE_TAG_PRODUCTS } from "@/lib/woocommerce-cache-tags";
import { wpProductSchema } from "@/schemas/wordpress";
import type { Product } from "@/features/products/types";

const fetchWooProductByIdMetaCached = unstable_cache(
  async (id: number) => {
    const woo = await createWooClient();
    const res = await woo.get(`/products/${id}`);
    return wpProductSchema.parse(res.data);
  },
  ["woo-product-meta-by-id-v1"],
  { revalidate: 300, tags: [WOO_CACHE_TAG_PRODUCTS] },
);

const fetchWooProductByIdFromCollectionCached = unstable_cache(
  async (id: number) => {
    const woo = await createWooClient();
    const res = await woo.get("/products", {
      params: { include: String(id), per_page: "1" },
    });
    const rows = Array.isArray(res.data) ? res.data : [];
    const first = rows[0];
    return first ? wpProductSchema.parse(first) : null;
  },
  ["woo-product-meta-by-id-collection-v1"],
  { revalidate: 300, tags: [WOO_CACHE_TAG_PRODUCTS] },
);

const fetchWooProductBySlugMetaCached = unstable_cache(
  async (slug: string) => {
    const woo = await createWooClient();
    const res = await woo.get("/products", {
      params: { slug, per_page: "1" },
    });
    const rows = Array.isArray(res.data) ? res.data : [];
    const first = rows[0];
    return first ? wpProductSchema.parse(first) : null;
  },
  ["woo-product-meta-by-slug-v1"],
  { revalidate: 300, tags: [WOO_CACHE_TAG_PRODUCTS] },
);

/**
 * يحلّ المنتج لمسار ‎`/products/[id]`‎: رقم تعريف Woo أو ‎`slug`‎ (لروابط قديمة / مشاركة).
 * يشمل ‎`outofstock`‎ — صفحة المنتج تعرض حالة «غير متوفر» بدل ‎`404`‎.
 *
 * ملاحظة: إن كان ‎`slug`‎ أرقاماً فقط يُفسَّر كـ **id** (سلوك Woo الشائع).
 */
export async function getProductMetaBySlugOrId(
  segment: string,
): Promise<Product | null> {
  const s = segment.trim();
  if (!s) return null;

  const fallbackProducts = getSnapshotProducts() ?? mockProducts;

  if (/^\d+$/.test(s)) {
    const id = Number(s);
    if (USE_MOCK) {
      const raw = fallbackProducts.find((p) => p.id === id);
      if (!raw) return null;
      return mapProduct(wpProductSchema.parse(raw));
    }
    try {
      const raw =
        (await fetchWooProductByIdMetaCached(id).catch(() => null)) ??
        (await fetchWooProductByIdFromCollectionCached(id).catch(() => null));
      if (!raw) return null;
      return mapProduct(raw);
    } catch {
      const raw = fallbackProducts.find((p) => p.id === id);
      if (!raw) return null;
      return mapProduct(wpProductSchema.parse(raw));
    }
  }

  if (USE_MOCK) {
    const raw = fallbackProducts.find((p) => p.slug === s);
    if (!raw) return null;
    return mapProduct(wpProductSchema.parse(raw));
  }
  try {
    const raw = await fetchWooProductBySlugMetaCached(s).catch(() => null);
    if (!raw) return null;
    return mapProduct(raw);
  } catch {
    const raw = fallbackProducts.find((p) => p.slug === s);
    if (!raw) return null;
    return mapProduct(wpProductSchema.parse(raw));
  }
}

export async function getProductByIdMeta(id: number): Promise<Product | null> {
  if (!Number.isFinite(id)) return null;
  return getProductMetaBySlugOrId(String(Math.trunc(id)));
}
