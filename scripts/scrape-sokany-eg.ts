/**
 * Scrape categories + products + media from sokany-eg.com via the public
 * WooCommerce Store API and write a snapshot under data/sokany-eg/ that
 * matches the wpProductSchema / wpCategorySchema shapes used by the
 * Next.js frontend.
 *
 * Usage:
 *   npm run scrape:sokany           # full sync
 *   npm run scrape:sokany:dry       # fetch + validate, do not write
 *
 * Environment overrides (optional):
 *   SCRAPE_BASE_URL       default https://sokany-eg.com
 *   SCRAPE_PER_PAGE       default 100
 *   SCRAPE_CONCURRENCY    default 4
 *   SCRAPE_MAX_PRODUCTS   default unlimited
 *   SCRAPE_SKIP_IMAGES    set to "1" to skip image downloads
 */

import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  wpCategoriesSchema,
  wpCategorySchema,
  wpProductSchema,
  wpProductsSchema,
} from "../schemas/wordpress";

// ───────────────────────────────────────────────────────────────────────────
// Configuration
// ───────────────────────────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(REPO_ROOT, "data", "sokany-eg");
const PUBLIC_IMG_ROOT = path.join(
  REPO_ROOT,
  "public",
  "images",
  "sokany-eg",
);
const PRODUCT_IMG_DIR = path.join(PUBLIC_IMG_ROOT, "products");
const CATEGORY_IMG_DIR = path.join(PUBLIC_IMG_ROOT, "categories");

const PUBLIC_IMG_BASE = "/images/sokany-eg";

const BASE_URL = (process.env.SCRAPE_BASE_URL ?? "https://sokany-eg.com").replace(
  /\/+$/,
  "",
);
const PER_PAGE = Number(process.env.SCRAPE_PER_PAGE ?? "100");
const CONCURRENCY = Math.max(1, Number(process.env.SCRAPE_CONCURRENCY ?? "4"));
const MAX_PRODUCTS = process.env.SCRAPE_MAX_PRODUCTS
  ? Number(process.env.SCRAPE_MAX_PRODUCTS)
  : Number.POSITIVE_INFINITY;
const SKIP_IMAGES = process.env.SCRAPE_SKIP_IMAGES === "1";

const DRY_RUN = process.argv.includes("--dry-run");

const USER_AGENT = "sokany-store-scraper/1.0 (+local-dev)";

// ───────────────────────────────────────────────────────────────────────────
// Store API response schemas (only the fields we need)
// ───────────────────────────────────────────────────────────────────────────

const storeImageSchema = z
  .object({
    id: z.number().nullish(),
    src: z.string().nullish(),
    thumbnail: z.string().nullish(),
    name: z.string().nullish(),
    alt: z.string().nullish(),
  })
  .passthrough();

const storeCategoryRefSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
  })
  .passthrough();

const storeCategorySchema = z
  .object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullish(),
    parent: z.number().nullish(),
    count: z.number().nullish(),
    image: storeImageSchema.nullish(),
  })
  .passthrough();

const storeProductSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    permalink: z.string(),
    type: z.string().nullish(),
    sku: z.string().nullish(),
    description: z.string().nullish(),
    short_description: z.string().nullish(),
    on_sale: z.boolean().nullish(),
    is_purchasable: z.boolean().nullish(),
    is_in_stock: z.boolean().nullish(),
    is_on_backorder: z.boolean().nullish(),
    average_rating: z.string().nullish(),
    review_count: z.number().nullish(),
    prices: z
      .object({
        price: z.string().nullish(),
        regular_price: z.string().nullish(),
        sale_price: z.string().nullish(),
        currency_minor_unit: z.number().nullish(),
      })
      .passthrough()
      .nullish(),
    images: z.array(storeImageSchema).nullish(),
    categories: z.array(storeCategoryRefSchema).nullish(),
    tags: z.array(storeCategoryRefSchema).nullish(),
  })
  .passthrough();

const storeCategoriesSchema = z.array(storeCategorySchema);
const storeProductsSchema = z.array(storeProductSchema);

// ───────────────────────────────────────────────────────────────────────────
// Generic fetch helpers (retry + concurrency)
// ───────────────────────────────────────────────────────────────────────────

interface PaginatedResponse<T> {
  data: T;
  totalPages: number;
  total: number;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  init: RequestInit = {},
  attempt = 0,
): Promise<Response> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
        ...(init.headers ?? {}),
      },
    });
    if (res.status === 429 || res.status >= 500) {
      throw new Error(`HTTP ${res.status} for ${url}`);
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${url} (no retry)`);
    }
    return res;
  } catch (err) {
    if (attempt >= 4) throw err;
    const backoff = 500 * 2 ** attempt;
    console.warn(
      `  retry ${attempt + 1}/4 after ${backoff}ms: ${(err as Error).message}`,
    );
    await sleep(backoff);
    return fetchWithRetry(url, init, attempt + 1);
  }
}

async function fetchJsonPage<T>(
  url: string,
  schema: z.ZodType<T>,
): Promise<PaginatedResponse<T>> {
  const res = await fetchWithRetry(url);
  const totalPages = Number(res.headers.get("x-wp-totalpages") ?? "1") || 1;
  const total = Number(res.headers.get("x-wp-total") ?? "0") || 0;
  const json = await res.json();
  const parsed = schema.parse(json);
  return { data: parsed, totalPages, total };
}

async function withConcurrency<T, R>(
  items: T[],
  worker: (item: T, index: number) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const runners = new Array(Math.min(concurrency, items.length))
    .fill(0)
    .map(async () => {
      while (true) {
        const idx = cursor++;
        if (idx >= items.length) return;
        results[idx] = await worker(items[idx], idx);
      }
    });
  await Promise.all(runners);
  return results;
}

// ───────────────────────────────────────────────────────────────────────────
// Image download (idempotent — skips files already on disk)
// ───────────────────────────────────────────────────────────────────────────

const downloadedImageCache = new Map<string, string>();

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

function shortHash(input: string): string {
  return createHash("sha1").update(input).digest("hex").slice(0, 10);
}

function extFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname).toLowerCase();
    if (/^\.(jpe?g|png|webp|avif|gif|svg)$/.test(ext)) return ext;
  } catch {
    /* ignore */
  }
  return ".jpg";
}

async function downloadImageOnce(
  remoteUrl: string,
  destDir: string,
  filenameBase: string,
): Promise<string> {
  const cached = downloadedImageCache.get(remoteUrl);
  if (cached) return cached;

  const ext = extFromUrl(remoteUrl);
  const fileName = `${filenameBase}-${shortHash(remoteUrl)}${ext}`;
  const absPath = path.join(destDir, fileName);
  const publicPath = `${PUBLIC_IMG_BASE}/${path
    .relative(PUBLIC_IMG_ROOT, absPath)
    .split(path.sep)
    .join("/")}`;

  if (DRY_RUN || SKIP_IMAGES) {
    downloadedImageCache.set(remoteUrl, publicPath);
    return publicPath;
  }

  try {
    await fs.access(absPath);
    downloadedImageCache.set(remoteUrl, publicPath);
    return publicPath;
  } catch {
    // not on disk yet — download below
  }

  await ensureDir(destDir);
  const res = await fetchWithRetry(remoteUrl, {
    headers: { Accept: "image/*" },
  });
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(absPath, buffer);
  downloadedImageCache.set(remoteUrl, publicPath);
  return publicPath;
}

// ───────────────────────────────────────────────────────────────────────────
// Transformers: Store API -> WC REST v3 shape (matches schemas/wordpress.ts)
// ───────────────────────────────────────────────────────────────────────────

const NOW_ISO = new Date().toISOString();

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#8211;/g, "–")
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code)),
    )
    .replace(/&nbsp;/g, " ");
}

async function transformCategory(
  raw: z.infer<typeof storeCategorySchema>,
): Promise<z.infer<typeof wpCategorySchema>> {
  let imageBlock: { id: number; src: string; alt: string } | null = null;
  if (raw.image && raw.image.src) {
    const remote = raw.image.src;
    const id = raw.image.id ?? raw.id;
    const localSrc = await downloadImageOnce(
      remote,
      CATEGORY_IMG_DIR,
      `cat-${raw.id}`,
    );
    imageBlock = {
      id,
      src: localSrc,
      alt: raw.image.alt ?? "",
    };
  }

  return wpCategorySchema.parse({
    id: raw.id,
    name: decodeHtmlEntities(raw.name),
    slug: raw.slug,
    description: raw.description ?? "",
    display: "default",
    image: imageBlock,
    parent: raw.parent ?? 0,
    count: raw.count ?? 0,
    _links: {},
  });
}

async function transformProduct(
  raw: z.infer<typeof storeProductSchema>,
  isFeatured: boolean,
): Promise<z.infer<typeof wpProductSchema>> {
  const prices = raw.prices ?? {};
  const minor = prices.currency_minor_unit ?? 0;
  const adjustForMinor = (value: string | null | undefined): string => {
    if (!value) return "";
    if (minor <= 0) return value;
    const asNumber = Number(value);
    if (!Number.isFinite(asNumber)) return value;
    return (asNumber / 10 ** minor).toFixed(minor);
  };

  const price = adjustForMinor(prices.price);
  const regular = adjustForMinor(prices.regular_price);
  const onSale = Boolean(raw.on_sale);
  // Store API mirrors `price` into `sale_price` even when not on sale; flatten
  // to the WC REST v3 convention where `sale_price` is empty unless on sale.
  const sale = onSale ? adjustForMinor(prices.sale_price) : "";

  const stockStatus: "instock" | "outofstock" | "onbackorder" = raw.is_on_backorder
    ? "onbackorder"
    : raw.is_in_stock === false
      ? "outofstock"
      : "instock";

  const images = await Promise.all(
    (raw.images ?? []).map(async (img, index) => {
      if (!img.src) return null;
      const localSrc = await downloadImageOnce(
        img.src,
        PRODUCT_IMG_DIR,
        `p-${raw.id}-${index}`,
      );
      return {
        id: img.id ?? raw.id * 1000 + index,
        src: localSrc,
        name: img.name ?? "",
        alt: img.alt ?? "",
      };
    }),
  );

  const cleanImages = images.filter(
    (entry): entry is NonNullable<typeof entry> => entry !== null,
  );

  return wpProductSchema.parse({
    id: raw.id,
    name: decodeHtmlEntities(raw.name),
    slug: raw.slug,
    permalink: raw.permalink,
    date_created: NOW_ISO,
    date_modified: NOW_ISO,
    type: raw.type ?? "simple",
    status: "publish",
    featured: isFeatured,
    catalog_visibility: "visible",
    description: raw.description ?? "",
    short_description: raw.short_description ?? "",
    sku: raw.sku ?? "",
    price: price || "0",
    regular_price: regular || price || "0",
    sale_price: sale,
    on_sale: onSale,
    purchasable: raw.is_purchasable ?? true,
    total_sales: 0,
    virtual: false,
    downloadable: false,
    manage_stock: false,
    stock_quantity: null,
    stock_status: stockStatus,
    backorders: "no",
    backorders_allowed: false,
    backordered: Boolean(raw.is_on_backorder),
    images: cleanImages,
    categories: (raw.categories ?? []).map((cat) => ({
      id: cat.id,
      name: decodeHtmlEntities(cat.name),
      slug: cat.slug,
    })),
    tags: (raw.tags ?? []).map((tag) => ({
      id: tag.id,
      name: decodeHtmlEntities(tag.name),
      slug: tag.slug,
    })),
    attributes: [],
    average_rating: raw.average_rating ?? "0",
    rating_count: raw.review_count ?? 0,
    meta_data: [],
  });
}

// ───────────────────────────────────────────────────────────────────────────
// High-level fetchers (handle pagination)
// ───────────────────────────────────────────────────────────────────────────

async function fetchAllCategories(): Promise<
  z.infer<typeof storeCategoriesSchema>
> {
  console.log("Fetching categories…");
  const all: z.infer<typeof storeCategoriesSchema> = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const url = `${BASE_URL}/wp-json/wc/store/v1/products/categories?per_page=${PER_PAGE}&page=${page}`;
    const { data, totalPages: tp } = await fetchJsonPage(
      url,
      storeCategoriesSchema,
    );
    all.push(...data);
    totalPages = tp;
    page++;
  }
  console.log(`  found ${all.length} categories`);
  return all;
}

async function fetchFeaturedProductIds(): Promise<Set<number>> {
  console.log("Fetching featured product IDs…");
  const ids = new Set<number>();
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const url = `${BASE_URL}/wp-json/wc/store/v1/products?featured=true&per_page=${PER_PAGE}&page=${page}`;
    const { data, totalPages: tp } = await fetchJsonPage(
      url,
      storeProductsSchema,
    );
    for (const p of data) ids.add(p.id);
    totalPages = tp;
    page++;
  }
  console.log(`  found ${ids.size} featured products`);
  return ids;
}

async function fetchAllProducts(): Promise<
  z.infer<typeof storeProductsSchema>
> {
  console.log("Fetching products (page 1 to discover totalPages)…");
  const firstUrl = `${BASE_URL}/wp-json/wc/store/v1/products?per_page=${PER_PAGE}&page=1`;
  const first = await fetchJsonPage(firstUrl, storeProductsSchema);
  console.log(
    `  total=${first.total} pages=${first.totalPages} (per_page=${PER_PAGE})`,
  );

  const remaining: number[] = [];
  for (let p = 2; p <= first.totalPages; p++) remaining.push(p);

  const otherPages = await withConcurrency(
    remaining,
    async (page) => {
      const url = `${BASE_URL}/wp-json/wc/store/v1/products?per_page=${PER_PAGE}&page=${page}`;
      const { data } = await fetchJsonPage(url, storeProductsSchema);
      console.log(`  page ${page}/${first.totalPages} (${data.length})`);
      return data;
    },
    CONCURRENCY,
  );

  const all = [...first.data, ...otherPages.flat()];
  if (Number.isFinite(MAX_PRODUCTS) && all.length > MAX_PRODUCTS) {
    return all.slice(0, MAX_PRODUCTS);
  }
  return all;
}

// ───────────────────────────────────────────────────────────────────────────
// Main pipeline
// ───────────────────────────────────────────────────────────────────────────

interface FailureLog {
  scope: "category" | "product";
  id: number | string;
  error: string;
}

async function main(): Promise<void> {
  const started = Date.now();
  console.log(`Source: ${BASE_URL}`);
  console.log(`Output: ${path.relative(REPO_ROOT, DATA_DIR)}/`);
  if (DRY_RUN) console.log("Mode: DRY RUN (no files will be written)");
  if (SKIP_IMAGES) console.log("Mode: SKIP_IMAGES (no images downloaded)");

  if (!DRY_RUN) {
    await ensureDir(DATA_DIR);
    await ensureDir(PRODUCT_IMG_DIR);
    await ensureDir(CATEGORY_IMG_DIR);
  }

  const errors: FailureLog[] = [];

  const rawCategories = await fetchAllCategories();
  console.log("Transforming categories…");
  const categories: z.infer<typeof wpCategoriesSchema> = [];
  for (const raw of rawCategories) {
    try {
      categories.push(await transformCategory(raw));
    } catch (err) {
      errors.push({
        scope: "category",
        id: raw.id,
        error: (err as Error).message,
      });
    }
  }
  console.log(`  ok=${categories.length} errors=${errors.length}`);

  const featuredIds = await fetchFeaturedProductIds();

  const rawProducts = await fetchAllProducts();
  console.log(`Transforming ${rawProducts.length} products…`);
  const products: z.infer<typeof wpProductsSchema> = [];
  let progress = 0;
  for (const raw of rawProducts) {
    progress++;
    try {
      products.push(await transformProduct(raw, featuredIds.has(raw.id)));
    } catch (err) {
      errors.push({
        scope: "product",
        id: raw.id,
        error: (err as Error).message,
      });
    }
    if (progress % 50 === 0) {
      console.log(`  ${progress}/${rawProducts.length}`);
    }
  }
  console.log(
    `  ok=${products.length} errors=${errors.filter((e) => e.scope === "product").length}`,
  );

  const manifest = {
    scrapedAt: new Date().toISOString(),
    source: BASE_URL,
    version: 1,
    totals: {
      categories: categories.length,
      products: products.length,
      featuredProducts: featuredIds.size,
    },
    options: {
      perPage: PER_PAGE,
      concurrency: CONCURRENCY,
      maxProducts: Number.isFinite(MAX_PRODUCTS) ? MAX_PRODUCTS : null,
      skipImages: SKIP_IMAGES,
    },
    elapsedMs: Date.now() - started,
  };

  if (DRY_RUN) {
    console.log("\nDRY RUN — sample category:");
    console.log(JSON.stringify(categories[0], null, 2));
    console.log("\nDRY RUN — sample product:");
    console.log(JSON.stringify(products[0], null, 2));
    console.log("\nManifest:");
    console.log(JSON.stringify(manifest, null, 2));
    if (errors.length) {
      console.log(`\nErrors (${errors.length}):`);
      console.log(JSON.stringify(errors.slice(0, 10), null, 2));
    }
    return;
  }

  await fs.writeFile(
    path.join(DATA_DIR, "categories.json"),
    JSON.stringify(categories, null, 2) + "\n",
    "utf8",
  );
  await fs.writeFile(
    path.join(DATA_DIR, "products.json"),
    JSON.stringify(products, null, 2) + "\n",
    "utf8",
  );
  await fs.writeFile(
    path.join(DATA_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
    "utf8",
  );
  await fs.writeFile(
    path.join(DATA_DIR, "_errors.json"),
    JSON.stringify(errors, null, 2) + "\n",
    "utf8",
  );

  console.log(
    `\nWrote ${categories.length} categories, ${products.length} products to ${path.relative(REPO_ROOT, DATA_DIR)}`,
  );
  console.log(`Elapsed: ${(manifest.elapsedMs / 1000).toFixed(1)}s`);
  if (errors.length) {
    console.log(
      `${errors.length} record(s) failed validation — see _errors.json`,
    );
  }
}

main().catch((err) => {
  console.error("Scrape failed:", err);
  process.exit(1);
});
