import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

const BANNER_DIR = path.join(process.cwd(), "public", "images", "banner-section");
const BANNER_PUBLIC_PATH = "/images/banner-section";

const EXTENSION_PRIORITY = [".webp", ".avif", ".jpg", ".jpeg", ".png", ".gif"] as const;

const SUPPORTED_EXTENSIONS = new Set<string>(EXTENSION_PRIORITY);

function extRank(ext: string): number {
  const i = EXTENSION_PRIORITY.indexOf(ext as (typeof EXTENSION_PRIORITY)[number]);
  return i === -1 ? 999 : i;
}

/** Leading ASCII digits at start of basename (e.g. `01-kitchen` → 1, `12` → 12). */
function leadingOrderKey(basename: string): number {
  const m = /^(\d+)/.exec(basename);
  if (!m) return Number.MAX_SAFE_INTEGER;
  return parseInt(m[1], 10);
}

/**
 * Lists images in `public/images/banner-section/` sorted by leading number in the filename
 * (`01.webp`, `02-kitchen.jpg`, …). Same numeric prefix → pick best extension (webp first).
 * Filenames with no leading digits sort after all numbered files, alphabetically.
 *
 * Assign to home parent sections by index: first parent section → first URL, etc.
 */
export async function getBannerSectionOrderedImages(): Promise<string[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(BANNER_DIR);
  } catch {
    return [];
  }

  type Row = { file: string; orderKey: number; rank: number; basename: string };
  const rows: Row[] = [];

  for (const name of entries) {
    if (name.startsWith(".")) continue;
    const ext = path.extname(name).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) continue;
    const basename = name.slice(0, -ext.length);
    if (!basename) continue;
    rows.push({
      file: name,
      orderKey: leadingOrderKey(basename),
      rank: extRank(ext),
      basename,
    });
  }

  rows.sort((a, b) => {
    if (a.orderKey !== b.orderKey) return a.orderKey - b.orderKey;
    if (a.rank !== b.rank) return a.rank - b.rank;
    return a.file.localeCompare(b.file, "en", { numeric: true });
  });

  const numbered = rows.filter((r) => r.orderKey !== Number.MAX_SAFE_INTEGER);
  const unnumbered = rows.filter((r) => r.orderKey === Number.MAX_SAFE_INTEGER);

  /** One URL per numeric order (e.g. both `01.jpg` and `01.webp`). */
  const byOrder = new Map<number, string>();
  for (const row of numbered) {
    if (byOrder.has(row.orderKey)) continue;
    byOrder.set(row.orderKey, `${BANNER_PUBLIC_PATH}/${row.file}`);
  }
  const orderedNumbered = [...byOrder.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, url]) => url);

  /** Unnumbered: one winner per basename (extension priority). */
  const byBasename = new Map<string, string>();
  for (const row of unnumbered) {
    if (byBasename.has(row.basename)) continue;
    byBasename.set(row.basename, `${BANNER_PUBLIC_PATH}/${row.file}`);
  }
  const orderedUnnumbered = [...byBasename.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], "en", { numeric: true }))
    .map(([, url]) => url);

  return [...orderedNumbered, ...orderedUnnumbered];
}
