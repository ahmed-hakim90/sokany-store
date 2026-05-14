import "server-only";

/**
 * حلّ مسار المنتج للـ SEO والـ RSC (`/products/[segment]`)
 * بالعامية: الـ segment ممكن يكون رقم (id) أو slug؛ بنجيب من Woo مع كاش، ولو فشل بنرجع لسنابشوت/موك. صفحة المنتج بتعرض حتى out-of-stock بدل 404.
 *
 * ملاحظات:
 * - ليه مسارين cached لنفس الـ id: fallback لو endpoint التفاصيل رفض أو اختلف السلوك.
 * - شوف كمان: `@/app/api/products/[id]/route.ts`
 */
import { unstable_cache } from "next/cache";
import { USE_MOCK } from "@/lib/constants";
import { createWooClient } from "@/lib/create-woo-client";
import { mapProduct } from "@/features/products/adapters";
import { mockProducts } from "@/features/products/mock";
import { getSnapshotProducts } from "@/features/data-snapshot/server";
import { WOO_BFF_UNSTABLE_CACHE_REVALIDATE_SEC } from "@/lib/woo-bff-revalidate";
import {
  wooProductDetailTag,
  wooProductSlugTag,
} from "@/lib/woocommerce-cache-tags";
import { wpProductSchema } from "@/schemas/wordpress";
import type { Product } from "@/features/products/types";

function fetchWooProductByIdMetaCached(id: number) {
  return unstable_cache(
    async () => {
      const woo = await createWooClient();
      const res = await woo.get(`/products/${id}`);
      return wpProductSchema.parse(res.data);
    },
    ["woo-product-meta-by-id-v2", String(id)],
    {
      revalidate: WOO_BFF_UNSTABLE_CACHE_REVALIDATE_SEC,
      tags: [wooProductDetailTag(id)],
    },
  )();
}

function fetchWooProductByIdFromCollectionCached(id: number) {
  return unstable_cache(
    async () => {
      const woo = await createWooClient();
      const res = await woo.get("/products", {
        params: { include: String(id), per_page: "1" },
      });
      const rows = Array.isArray(res.data) ? res.data : [];
      const first = rows[0];
      return first ? wpProductSchema.parse(first) : null;
    },
    ["woo-product-meta-by-id-collection-v2", String(id)],
    {
      revalidate: WOO_BFF_UNSTABLE_CACHE_REVALIDATE_SEC,
      tags: [wooProductDetailTag(id)],
    },
  )();
}

function fetchWooProductBySlugMetaCached(slug: string) {
  return unstable_cache(
    async () => {
      const woo = await createWooClient();
      const res = await woo.get("/products", {
        params: { slug, per_page: "1" },
      });
      const rows = Array.isArray(res.data) ? res.data : [];
      const first = rows[0];
      return first ? wpProductSchema.parse(first) : null;
    },
    ["woo-product-meta-by-slug-v2", slug],
    {
      revalidate: WOO_BFF_UNSTABLE_CACHE_REVALIDATE_SEC,
      tags: [wooProductSlugTag(slug)],
    },
  )();
}

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
