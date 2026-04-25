import { NextResponse } from "next/server";
import { storeHotlineResponseSchema } from "@/schemas/store-hotline";

const DEFAULT_HOTLINE = "17355";

function fallbackHotline(): string {
  return process.env.STORE_CUSTOMER_HOTLINE?.trim() || DEFAULT_HOTLINE;
}

function fallbackJson() {
  return NextResponse.json({ hotline: fallbackHotline() });
}

export async function GET() {
  const base = process.env.WC_BASE_URL?.trim();
  if (!base) {
    return fallbackJson();
  }

  const pathRaw =
    process.env.WP_HOTLINE_REST_PATH?.trim() ?? "/wp-json/sokany/v1/hotline";
  const path = pathRaw.startsWith("/") ? pathRaw : `/${pathRaw}`;

  let url: URL;
  try {
    url = new URL(path, base);
  } catch {
    return fallbackJson();
  }

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return fallbackJson();
    }
    const json: unknown = await res.json();
    const parsed = storeHotlineResponseSchema.safeParse(json);
    if (!parsed.success) {
      return fallbackJson();
    }
    return NextResponse.json(parsed.data);
  } catch {
    return fallbackJson();
  }
}
