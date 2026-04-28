import { WP_JWT_AUTH_TOKEN_PATH_DEFAULT } from "@/lib/constants";

/** مسار REST لإصدار JWT؛ يُحدَّد عبر ‎WC_JWT_AUTH_TOKEN_PATH‎ أو الافتراضي للإضافة الشائعة. */
export function getWordPressJwtTokenPath(): string {
  const fromEnv = process.env.WC_JWT_AUTH_TOKEN_PATH?.trim();
  if (fromEnv) {
    if (!fromEnv.startsWith("/")) {
      throw new Error("WC_JWT_AUTH_TOKEN_PATH must start with / (e.g. /wp-json/jwt-auth/v1/token)");
    }
    return fromEnv;
  }
  return WP_JWT_AUTH_TOKEN_PATH_DEFAULT;
}

export function getWordPressJwtTokenUrl(): string {
  const base = process.env.WC_BASE_URL;
  if (!base) {
    throw new Error("WC_BASE_URL is not configured");
  }
  return new URL(getWordPressJwtTokenPath(), base).toString();
}
