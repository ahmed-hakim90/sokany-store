import "server-only";

import { getSnapshotCategories } from "@/features/data-snapshot/server";
import { mockCategories } from "@/features/categories/mock";
import { mapCategories } from "@/features/categories/adapters";
import { fetchCachedWooCategories } from "@/features/categories/services/fetchCachedWooCategories";
import { wpCategoriesSchema } from "@/schemas/wordpress";
import type { CategoryQueryParams } from "@/types";
import type { Category } from "@/features/categories/types";

function paramsToRecord(params?: CategoryQueryParams): Record<string, string> {
  const out: Record<string, string> = {};
  if (!params) return out;
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    out[k] = String(v);
  }
  return out;
}

/**
 * جلب تصنيفات للـ RSC — نفس منطق ‎`/api/categories`‎ مع تخزين ‎`unstable_cache`‎ المشترك.
 * عند فشل Woo يُستخدم لقطة/‎`mock`‎ (مثل ‎`getProductsServer`‎).
 */
export async function getCategoriesServer(
  params?: CategoryQueryParams,
): Promise<Category[]> {
  const record = paramsToRecord(params);
  try {
    const cached = await fetchCachedWooCategories(JSON.stringify(record));
    return mapCategories(wpCategoriesSchema.parse(cached.data));
  } catch {
    const slug = record.slug;
    const sourceCategories = getSnapshotCategories() ?? mockCategories;
    const data = slug
      ? sourceCategories.filter((c) => c.slug === slug)
      : sourceCategories;
    return mapCategories(wpCategoriesSchema.parse(data));
  }
}
