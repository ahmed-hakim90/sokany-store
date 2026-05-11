import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

const root = process.cwd();

function loadEnvFile(path) {
  let text = "";
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return;
  }

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(root, ".env"));
loadEnvFile(resolve(root, ".env.local"));

const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();

if (!rawServiceAccount) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not set.");
}
if (!bucketName) {
  throw new Error("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set.");
}

const serviceAccount = JSON.parse(rawServiceAccount);
const cors = JSON.parse(
  readFileSync(resolve(root, "firebase/storage.cors.json"), "utf8"),
);

const app =
  getApps()[0] ??
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: bucketName,
  });

const bucket = getStorage(app).bucket(bucketName);
await bucket.setMetadata({ cors });

console.log(`Applied Firebase Storage CORS to gs://${bucketName}`);
