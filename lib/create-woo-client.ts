import "server-only";
import axios from "axios";
import { WC_REST_BASE_PATH } from "@/lib/constants";
import { resolveWooBaseUrlForServer } from "@/lib/resolve-woo-base-url";

/**
 * يربط REST وو عبر ‎`WC_CONSUMER_KEY` / ‎`WC_CONSUMER_SECRET` + أصل المتجر
 * (‎`WC_BASE_URL` أو ‎`storefrontIntegrations.wooBaseUrl` في CMS).
 */
export async function createWooClient() {
  const baseURL = await resolveWooBaseUrlForServer();
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;
  if (!baseURL || !key || !secret) {
    throw new Error("WooCommerce server environment is not configured");
  }
  const token = Buffer.from(`${key}:${secret}`).toString("base64");
  return axios.create({
    baseURL: new URL(WC_REST_BASE_PATH, baseURL).toString(),
    headers: {
      Authorization: `Basic ${token}`,
      "Content-Type": "application/json",
    },
  });
}
