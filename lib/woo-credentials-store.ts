import "server-only";

import * as admin from "firebase-admin";
import { z } from "zod";
import { getAdminFirestore } from "@/lib/firebase-admin";
import {
  canEncryptWooCredentials,
  decryptWooCredential,
  encryptWooCredential,
} from "@/lib/woo-credentials-encryption";

const WOO_SECRETS_COLLECTION = "storefront_secrets";
const WOO_CREDENTIALS_DOC = "woo_credentials";

export const wooCredentialsInputSchema = z.object({
  consumerKey: z.string().trim().regex(/^ck_[A-Za-z0-9]+$/, "Consumer key must start with ck_"),
  consumerSecret: z.string().trim().regex(/^cs_[A-Za-z0-9]+$/, "Consumer secret must start with cs_"),
});

type StoredWooCredentialsDoc = {
  consumerKeyEncrypted?: unknown;
  consumerSecretEncrypted?: unknown;
  updatedAt?: unknown;
  updatedByUid?: unknown;
};

export type WooCredentials = z.infer<typeof wooCredentialsInputSchema>;

export type WooCredentialSource = "env" | "firestore";

export type ResolvedWooCredentials = WooCredentials & {
  source: WooCredentialSource;
};

function getEnvWooCredentials(): ResolvedWooCredentials | null {
  const consumerKey = process.env.WC_CONSUMER_KEY?.trim();
  const consumerSecret = process.env.WC_CONSUMER_SECRET?.trim();
  if (!consumerKey || !consumerSecret) return null;
  const parsed = wooCredentialsInputSchema.safeParse({ consumerKey, consumerSecret });
  if (!parsed.success) return null;
  return { ...parsed.data, source: "env" };
}

function getDocRef() {
  return getAdminFirestore()
    .collection(WOO_SECRETS_COLLECTION)
    .doc(WOO_CREDENTIALS_DOC);
}

export async function getEncryptedWooCredentialsStatus(): Promise<{
  exists: boolean;
  canDecrypt: boolean;
}> {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return { exists: false, canDecrypt: canEncryptWooCredentials() };
  }
  try {
    const snap = await getDocRef().get();
    return { exists: snap.exists, canDecrypt: canEncryptWooCredentials() };
  } catch {
    return { exists: false, canDecrypt: canEncryptWooCredentials() };
  }
}

export async function getFirestoreWooCredentials(): Promise<ResolvedWooCredentials | null> {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) return null;
  const snap = await getDocRef().get();
  if (!snap.exists) return null;

  const data = snap.data() as StoredWooCredentialsDoc | undefined;
  const consumerKeyEncrypted =
    typeof data?.consumerKeyEncrypted === "string" ? data.consumerKeyEncrypted : "";
  const consumerSecretEncrypted =
    typeof data?.consumerSecretEncrypted === "string" ? data.consumerSecretEncrypted : "";
  if (!consumerKeyEncrypted || !consumerSecretEncrypted) return null;

  const parsed = wooCredentialsInputSchema.safeParse({
    consumerKey: decryptWooCredential(consumerKeyEncrypted),
    consumerSecret: decryptWooCredential(consumerSecretEncrypted),
  });
  if (!parsed.success) return null;
  return { ...parsed.data, source: "firestore" };
}

export async function resolveWooCredentialsForServer(): Promise<ResolvedWooCredentials | null> {
  const fromEnv = getEnvWooCredentials();
  if (fromEnv) return fromEnv;
  return getFirestoreWooCredentials();
}

export async function saveEncryptedWooCredentials(
  credentials: WooCredentials,
  updatedByUid: string,
): Promise<void> {
  const parsed = wooCredentialsInputSchema.parse(credentials);
  await getDocRef().set(
    {
      consumerKeyEncrypted: encryptWooCredential(parsed.consumerKey),
      consumerSecretEncrypted: encryptWooCredential(parsed.consumerSecret),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedByUid,
    },
    { merge: true },
  );
}
