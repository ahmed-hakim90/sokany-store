/**
 * Resize hero JPEGs in public/images/hero/ to fit inside 660×1080 (2× design spec).
 * Does not upscale small assets. Run from repo root: node scripts/optimize-hero-images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const HERO_DIR = path.join(process.cwd(), "public", "images", "hero");
const MAX_W = 660;
const MAX_H = 1080;
const JPEG_QUALITY = 85;

async function optimizeFile(name) {
  const input = path.join(HERO_DIR, name);
  if (!fs.existsSync(input)) {
    console.warn("skip missing", name);
    return;
  }
  const ext = path.extname(name).toLowerCase();
  if (![".jpg", ".jpeg"].includes(ext)) return;

  const buf = await sharp(input)
    .rotate()
    .resize(MAX_W, MAX_H, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  await fs.promises.writeFile(input, buf);
  const meta = await sharp(buf).metadata();
  console.log(`${name} → ${meta.width}×${meta.height} (${buf.length} bytes)`);
}

const files = [
  "home-appliances-2.jpg",
  "home-appliances-3.jpg",
  "home-appliances-4.jpg",
  "home-appliances-5.jpg",
];

for (const f of files) {
  await optimizeFile(f);
}
