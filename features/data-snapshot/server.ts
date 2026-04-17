import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";
import {
  wpCategoriesSchema,
  wpProductsSchema,
} from "@/schemas/wordpress";
import type { WCCategory } from "@/features/categories/types";
import type { WCProduct } from "@/features/products/types";

/**
 * Loader for the JSON snapshot produced by `scripts/scrape-sokany-eg.ts`.
 *
 * - Reads `data/sokany-eg/{products,categories}.json` once per process and
 *   keeps the parsed arrays in memory.
 * - If the snapshot is missing or invalid, returns `null` so callers can fall
 *   back to the hand-curated mocks in `features/{products,categories}/mock.ts`.
 */

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
