import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { revalidateTag } from "next/cache";
import { CMS_DOC_IDS, STOREFRONT_CMS_COLLECTION } from "@/features/cms/lib/collections";
import { CMS_CACHE_TAG } from "@/features/cms/services/getPublicSiteContent";
import { requireControlSession } from "@/lib/api-control-auth";
import { getAdminFirestore } from "@/lib/firebase-admin";
import {
  cmsBranchesDocSchema,
  cmsHomeHeroDocSchema,
  cmsRetailersDocSchema,
  cmsSectionBannersDocSchema,
  cmsSiteConfigDocSchema,
  cmsSpotlightsDocSchema,
} from "@/schemas/cms";

export const runtime = "nodejs";

const PUT_KEYS = [
  "site_config",
  "home_hero",
  "section_banners",
  "branches",
  "retailers",
  "spotlights",
] as const;

type PutKey = (typeof PUT_KEYS)[number];

function parsePutKey(k: string): PutKey | null {
  return PUT_KEYS.includes(k as PutKey) ? (k as PutKey) : null;
}

export async function GET(request: NextRequest) {
  const auth = await requireControlSession(request);
  if (auth instanceof NextResponse) return auth;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
  }

  try {
    const db = getAdminFirestore();
    const col = db.collection(STOREFRONT_CMS_COLLECTION);
    const snaps = await Promise.all([
      col.doc(CMS_DOC_IDS.siteConfig).get(),
      col.doc(CMS_DOC_IDS.homeHero).get(),
      col.doc(CMS_DOC_IDS.sectionBanners).get(),
      col.doc(CMS_DOC_IDS.branches).get(),
      col.doc(CMS_DOC_IDS.retailers).get(),
      col.doc(CMS_DOC_IDS.spotlights).get(),
    ]);
    const [
      siteConfig,
      homeHero,
      sectionBanners,
      branches,
      retailers,
      spotlights,
    ] = snaps.map((s) => (s.exists ? s.data() : null));

    return NextResponse.json({
      site_config: siteConfig ?? null,
      home_hero: homeHero ?? null,
      section_banners: sectionBanners ?? null,
      branches: branches ?? null,
      retailers: retailers ?? null,
      spotlights: spotlights ?? null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Read failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireControlSession(request);
  if (auth instanceof NextResponse) return auth;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const key = (body as { key?: string }).key;
  const data = (body as { data?: unknown }).data;
  const putKey = typeof key === "string" ? parsePutKey(key) : null;
  if (!putKey || data === undefined) {
    return NextResponse.json(
      { error: "Expected { key, data } where key is one of CMS documents" },
      { status: 400 },
    );
  }

  const ts = admin.firestore.FieldValue.serverTimestamp();
  let docId: string;
  let parsed: Record<string, unknown>;

  switch (putKey) {
    case "site_config": {
      const r = cmsSiteConfigDocSchema.safeParse(data);
      if (!r.success) {
        return NextResponse.json({ error: r.error.flatten() }, { status: 400 });
      }
      docId = CMS_DOC_IDS.siteConfig;
      parsed = { ...r.data, updatedAt: ts };
      break;
    }
    case "home_hero": {
      const r = cmsHomeHeroDocSchema.safeParse(data);
      if (!r.success) {
        return NextResponse.json({ error: r.error.flatten() }, { status: 400 });
      }
      docId = CMS_DOC_IDS.homeHero;
      parsed = { ...r.data, updatedAt: ts };
      break;
    }
    case "section_banners": {
      const r = cmsSectionBannersDocSchema.safeParse(data);
      if (!r.success) {
        return NextResponse.json({ error: r.error.flatten() }, { status: 400 });
      }
      docId = CMS_DOC_IDS.sectionBanners;
      parsed = { ...r.data, updatedAt: ts };
      break;
    }
    case "branches": {
      const r = cmsBranchesDocSchema.safeParse(data);
      if (!r.success) {
        return NextResponse.json({ error: r.error.flatten() }, { status: 400 });
      }
      docId = CMS_DOC_IDS.branches;
      parsed = { ...r.data, updatedAt: ts };
      break;
    }
    case "retailers": {
      const r = cmsRetailersDocSchema.safeParse(data);
      if (!r.success) {
        return NextResponse.json({ error: r.error.flatten() }, { status: 400 });
      }
      docId = CMS_DOC_IDS.retailers;
      parsed = { ...r.data, updatedAt: ts };
      break;
    }
    case "spotlights": {
      const r = cmsSpotlightsDocSchema.safeParse(data);
      if (!r.success) {
        return NextResponse.json({ error: r.error.flatten() }, { status: 400 });
      }
      docId = CMS_DOC_IDS.spotlights;
      parsed = { ...r.data, updatedAt: ts };
      break;
    }
    default:
      return NextResponse.json({ error: "Unknown key" }, { status: 400 });
  }

  try {
    const db = getAdminFirestore();
    await db.collection(STOREFRONT_CMS_COLLECTION).doc(docId).set(parsed, { merge: true });
    revalidateTag(CMS_CACHE_TAG, "max");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Write failed" }, { status: 500 });
  }
}
