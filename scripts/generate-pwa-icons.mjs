/**
 * One-off: resize PWA source PNG to standard sizes + favicon.ico.
 * Source: public/images/pwa-icon-source.png
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "public/images/pwa-icon-source.png");

async function main() {
  const img = sharp(src);

  await img
    .clone()
    .resize(192, 192, { fit: "cover", position: "centre" })
    .png()
    .toFile(path.join(root, "public/images/icon-192.png"));

  await img
    .clone()
    .resize(512, 512, { fit: "cover", position: "centre" })
    .png()
    .toFile(path.join(root, "public/images/icon-512.png"));

  await img
    .clone()
    .resize(180, 180, { fit: "cover", position: "centre" })
    .png()
    .toFile(path.join(root, "public/apple-touch-icon.png"));

  const b16 = await sharp(src)
    .resize(16, 16, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();
  const b32 = await sharp(src)
    .resize(32, 32, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();
  const b48 = await sharp(src)
    .resize(48, 48, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  const ico = await pngToIco([b16, b32, b48]);
  fs.writeFileSync(path.join(root, "app/favicon.ico"), ico);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
