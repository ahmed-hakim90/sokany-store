import "server-only";

/**
 * سنابشوت JSON محلي (سكربت السكرب)
 * بالعامية: بنقرا `data/sokany-eg/*.json` مرة ونخزن في الذاكرة؛ لو الملف مش موجود أو بايظ بنرجع `null` والنداء يقع على الموك اليدوي.
 *
 * ملاحظات:
 * - المصدر: `scripts/scrape-sokany-eg.ts`
 * - شوف كمان: `@/features/products/mock.ts`، `@/app/api/products/route.ts`
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  wpCategoriesSchema,
  wpProductsSchema,
} from "@/schemas/wordpress";
import type { WCCategory } from "@/features/categories/types";
import type { WCProduct } from "@/features/products/types";

const SNAPSHOT_DIR = path.join(process.cwd(), "data", "sokany-eg");
const PRODUCTS_FILE = path.join(SNAPSHOT_DIR, "products.json");
const CATEGORIES_FILE = path.join(SNAPSHOT_DIR, "categories.json");

let productsCache: WCProduct[] | null | undefined;
let categoriesCache: WCCategory[] | null | undefined;

function loadJson<T>(file: string, parser: (raw: unknown) => T): T | null {
  try {
    const raw = readFileSync(file, "utf8");
    if (!raw.trim()) return null;
    return parser(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function getSnapshotProducts(): WCProduct[] | null {
  if (productsCache !== undefined) return productsCache;
  productsCache = loadJson(PRODUCTS_FILE, (json) => {
    const parsed = wpProductsSchema.safeParse(json);
    return parsed.success ? (parsed.data as WCProduct[]) : null;
  });
  return productsCache;
}

export function getSnapshotCategories(): WCCategory[] | null {
  if (categoriesCache !== undefined) return categoriesCache;
  categoriesCache = loadJson(CATEGORIES_FILE, (json) => {
    const parsed = wpCategoriesSchema.safeParse(json);
    return parsed.success ? (parsed.data as WCCategory[]) : null;
  });
  return categoriesCache;
}

export function hasSnapshot(): boolean {
  return getSnapshotProducts() !== null || getSnapshotCategories() !== null;
}
