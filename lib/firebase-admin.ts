import "server-only";
import * as admin from "firebase-admin";
import { getStorage } from "firebase-admin/storage";
import { STOREFRONT_CUSTOMERS_COLLECTION } from "@/features/checkout/lib/firestore-collections";
import type { FirestoreCustomer } from "@/schemas/firebase-customer";
import { firestoreCustomerSchema } from "@/schemas/firebase-customer";

function getServiceAccountJson(): Record<string, unknown> {
  let raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON is not set. Add the Firebase service account JSON (single line) for server-side Auth/Firestore.",
    );
  }
  // شائع في .env: لفّ القيمة بعلامات تنصيص مفردة حول JSON كامل
  if (raw.startsWith("'") && raw.endsWith("'")) {
    raw = raw.slice(1, -1).trim();
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON ليس JSON صالحاً. انسخ محتوى ملف مفتاح الخدمة كسطر واحد (بدون أسطر جديدة داخل القيمة)، أو نفّذ: jq -c . service-account.json وألصق الناتج. تجنب المسافات أو الأحرف قبل { الأولى.",
    );
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON must be a JSON object.");
  }
  return parsed as Record<string, unknown>;
}

export function getFirebaseAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.app();
  }
  const cred = admin.credential.cert(getServiceAccountJson() as admin.ServiceAccount);
  return admin.initializeApp({ credential: cred });
}

export async function verifyFirebaseIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
  const app = getFirebaseAdminApp();
  return admin.auth(app).verifyIdToken(idToken);
}

export function getAdminFirestore(): admin.firestore.Firestore {
  return admin.firestore(getFirebaseAdminApp());
}

export function getAdminStorageBucket(): ReturnType<ReturnType<typeof getStorage>["bucket"]> {
  const app = getFirebaseAdminApp();
  const name = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  const storage = getStorage(app);
  return name ? storage.bucket(name) : storage.bucket();
}

export async function getStorefrontCustomerByUid(
  uid: string,
): Promise<FirestoreCustomer | null> {
  const app = getFirebaseAdminApp();
  const snap = await admin.firestore(app).collection(STOREFRONT_CUSTOMERS_COLLECTION).doc(uid).get();
  if (!snap.exists) {
    return null;
  }
  const data = snap.data();
  const parsed = firestoreCustomerSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
}
