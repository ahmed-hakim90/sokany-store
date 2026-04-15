import { WP_JWT_AUTH_TOKEN_PATH } from "@/lib/constants";

export function getWordPressJwtTokenUrl(): string {
  const base = process.env.WC_BASE_URL;
  if (!base) {
    throw new Error("WC_BASE_URL is not configured");
  }
  return new URL(WP_JWT_AUTH_TOKEN_PATH, base).toString();
}
