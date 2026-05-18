/**
 * Resize PWA source to standard sizes + favicon.ico.
 * Strips white/light backdrop (flood from edges) before export.
 *
 * Usage:
 *   node scripts/generate-pwa-icons.mjs [source-image]
 * Default source: public/images/pwa-icon-source.png
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const defaultSrc = path.join(root, "public/images/pwa-icon-source.png");
const inputPath = path.resolve(root, process.argv[2] ?? defaultSrc);
const processedSrc = path.join(root, "public/images/pwa-icon-source.png");

/** Light neutral pixels connected to the image edge (white mat + drop shadow). */
function isBackdropPixel(r, g, b) {
  const avg = (r + g + b) / 3;
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  return avg >= 178 && spread <= 72;
}

async function stripLightBackdrop(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const backdrop = new Uint8Array(width * height);
  const queue = [];

  const trySeed = (x, y) => {
    const i = (y * width + x) * 4;
    if (!isBackdropPixel(data[i], data[i + 1], data[i + 2])) return;
    const idx = y * width + x;
    if (backdrop[idx]) return;
    backdrop[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x++) {
    trySeed(x, 0);
    trySeed(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    trySeed(0, y);
    trySeed(width - 1, y);
  }

  while (queue.length > 0) {
    const idx = queue.pop();
    const x = idx % width;
    const y = (idx - x) / width;
    const neighbors = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];
    for (const [nx, ny] of neighbors) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const nIdx = ny * width + nx;
      if (backdrop[nIdx]) continue;
      const o = nIdx * 4;
      if (!isBackdropPixel(data[o], data[o + 1], data[o + 2])) continue;
      backdrop[nIdx] = 1;
      queue.push(nIdx);
    }
  }

  for (let i = 0; i < width * height; i++) {
    if (backdrop[i]) data[i * 4 + 3] = 0;
  }

  // Anti-alias halo left on the squircle edge after mat removal.
  const defringePasses = 6;
  for (let pass = 0; pass < defringePasses; pass++) {
    const remove = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const o = idx * 4;
        if (data[o + 3] === 0) continue;
        const r = data[o];
        const g = data[o + 1];
        const b = data[o + 2];
        const avg = (r + g + b) / 3;
        const spread = Math.max(r, g, b) - Math.min(r, g, b);
        if (avg < 128 || spread > 96) continue;

        let touchesTransparent = false;
        for (const [nx, ny] of [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1],
        ]) {
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (data[(ny * width + nx) * 4 + 3] === 0) {
            touchesTransparent = true;
            break;
          }
        }
        if (touchesTransparent) remove.push(idx);
      }
    }
    for (const idx of remove) data[idx * 4 + 3] = 0;
    if (remove.length === 0) break;
  }

  return sharp(data, { raw: { width, height, channels: 4 } })
    .trim()
    .png();
}

async function prepareSource() {
  const stripped = await stripLightBackdrop(inputPath);
  await stripped.toFile(processedSrc);
  return processedSrc;
}

async function main() {
  const src = await prepareSource();
  const img = sharp(src);

  await img
    .clone()
    .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(root, "public/images/icon-192.png"));

  await img
    .clone()
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(root, "public/images/icon-512.png"));

  await img
    .clone()
    .resize(180, 180, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(root, "public/apple-touch-icon.png"));

  const resizeOpts = {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  };
  const b16 = await sharp(src).resize(16, 16, resizeOpts).png().toBuffer();
  const b32 = await sharp(src).resize(32, 32, resizeOpts).png().toBuffer();
  const b48 = await sharp(src).resize(48, 48, resizeOpts).png().toBuffer();

  const ico = await pngToIco([b16, b32, b48]);
  fs.writeFileSync(path.join(root, "app/favicon.ico"), ico);

  console.log(`PWA icons generated from ${inputPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
