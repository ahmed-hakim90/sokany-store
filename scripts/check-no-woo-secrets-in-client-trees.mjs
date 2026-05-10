#!/usr/bin/env node
/**
 * يفشل إن وُجدت أسماء متغيرات أسرار Woo في أشجار الواجهة (متجر + مكوّنات + hooks).
 * لا يستبدل مراجعة أسرار حقيقية في ‎`NEXT_PUBLIC_*`‎ — فقط حارس سريع في CI.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const TREES = ["app/(storefront)", "components", "hooks"];
const EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);

const NEEDLES = ["WC_CONSUMER_KEY", "WC_CONSUMER_SECRET", "WC_WEBHOOK_SECRET"];

function walk(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (EXT.has(path.extname(name))) out.push(p);
  }
}

let bad = [];
for (const rel of TREES) {
  const base = path.join(root, rel);
  const files = [];
  walk(base, files);
  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    for (const n of NEEDLES) {
      if (raw.includes(n)) {
        bad.push({ file: path.relative(root, file), needle: n });
      }
    }
  }
}

if (bad.length) {
  console.error("Woo secret / server-only references in client trees:\n");
  for (const b of bad) {
    console.error(`  ${b.file}: ${b.needle}`);
  }
  process.exit(1);
}
console.log("OK: no Woo server secret markers in storefront/components/hooks.");
