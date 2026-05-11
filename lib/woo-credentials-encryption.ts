import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const KEY_ENV = "WOO_CREDENTIALS_ENCRYPTION_KEY";
const PREFIX = "v1";

function getEncryptionKey(): Buffer {
  const raw = process.env[KEY_ENV]?.trim();
  if (!raw) {
    throw new Error(`${KEY_ENV} is not set`);
  }

  if (raw.startsWith("base64:")) {
    const key = Buffer.from(raw.slice("base64:".length), "base64");
    if (key.length === 32) return key;
  }

  if (/^[a-f0-9]{64}$/i.test(raw)) {
    return Buffer.from(raw, "hex");
  }

  // Allows long passphrases while still producing the fixed 32-byte key AES-256 needs.
  return createHash("sha256").update(raw, "utf8").digest();
}

export function canEncryptWooCredentials(): boolean {
  try {
    getEncryptionKey();
    return true;
  } catch {
    return false;
  }
}

export function encryptWooCredential(plainText: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    PREFIX,
    iv.toString("base64"),
    tag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
}

export function decryptWooCredential(payload: string): string {
  const [version, ivB64, tagB64, ciphertextB64] = payload.split(":");
  if (version !== PREFIX || !ivB64 || !tagB64 || !ciphertextB64) {
    throw new Error("Invalid Woo credential payload");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivB64, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextB64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
