import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { HomeHeroSlide } from "@/features/home/components/home-hero-banner";

const HERO_DIR = path.join(process.cwd(), "public", "images", "hero");
const HERO_PUBLIC_PATH = "/images/hero";
const MANIFEST_FILE = "manifest.json";
const SUPPORTED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
]);

const heroManifestEntrySchema = z.object({
  file: z.string().min(1),
  alt: z.string().optional(),
  href: z.string().optional(),
});

const heroManifestSchema = z.array(heroManifestEntrySchema);

/**
 * Read all hero banner images from `public/images/hero/`.
 *
 * - If `manifest.json` exists in the same folder, only the entries listed
 *   there are shown (in that exact order), and each entry's `alt`/`href`
 *   override the defaults.
 * - Otherwise, every supported image in the folder is auto-discovered and
 *   sorted alphabetically (use `01-`, `02-` prefixes to control order).
 */
export async function getHeroSlides(): Promise<HomeHeroSlide[]> {
  const manifest = await readManifest();
  if (manifest && manifest.length > 0) {
    const existingFiles = new Set(await listImageFiles());
    return manifest
      .filter((entry) => existingFiles.has(entry.file))
      .map((entry) => ({
        imageSrc: `${HERO_PUBLIC_PATH}/${entry.file}`,
        imageAlt: entry.alt ?? humanizeFileName(entry.file),
        href: entry.href,
      }));
  }

  const files = await listImageFiles();
  return files.map<HomeHeroSlide>((file) => ({
    imageSrc: `${HERO_PUBLIC_PATH}/${file}`,
    imageAlt: humanizeFileName(file),
  }));
}

async function listImageFiles(): Promise<string[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(HERO_DIR);
  } catch {
    return [];
  }
  return entries
    .filter((name) => SUPPORTED_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .filter((name) => !name.startsWith("."))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
}

async function readManifest(): Promise<z.infer<typeof heroManifestSchema> | null> {
  try {
    const raw = await fs.readFile(path.join(HERO_DIR, MANIFEST_FILE), "utf8");
    const parsed = heroManifestSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function humanizeFileName(file: string): string {
  const base = file.replace(/\.[^.]+$/, "");
  return base.replace(/[-_]+/g, " ").trim();
}
