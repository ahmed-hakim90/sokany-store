import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { revalidateTag } from "next/cache";
import { CMS_DOC_IDS, STOREFRONT_CMS_COLLECTION } from "@/features/cms/lib/collections";
import { CMS_CACHE_TAG } from "@/features/cms/services/getPublicSiteContent";
import { requireControlSession, requireCmsPutKey } from "@/lib/api-control-auth";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { parseCmsDocumentPutKey, type CmsDocumentPutKey } from "@/lib/control-cms-keys";
import {
  cmsBranchesDocSchema,
  cmsHomeHeroDocSchema,
  cmsRetailersDocSchema,
  cmsSectionBannersDocSchema,
  cmsSiteConfigDocSchema,
  cmsSpotlightsDocSchema,
} from "@/schemas/cms";

export const runtime = "nodejs";

type PutKey = CmsDocumentPutKey;

function parsePutKey(k: string): PutKey | null {
  return parseCmsDocumentPutKey(k);
}

function pickCmsBundle(
  data: {
    site_config: unknown;
    home_hero: unknown;
    section_banners: unknown;
    branches: unknown;
    retailers: unknown;
    spotlights: unknown;
  },
  allowed: (k: CmsDocumentPutKey) => boolean,
) {
  return {
    site_config: allowed("site_config") ? data.site_config : null,
    home_hero: allowed("home_hero") ? data.home_hero : null,
    section_banners: allowed("section_banners") ? data.section_banners : null,
    branches: allowed("branches") ? data.branches : null,
    retailers: allowed("retailers") ? data.retailers : null,
    spotlights: allowed("spotlights") ? data.spotlights : null,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireControlSession(request);
  if (auth instanceof NextResponse) return auth;
  if (auth.scope === "media") {
    return NextResponse.json(
      { error: "ليس لديك صلاحية قراءة إعدادات CMS" },
      { status: 403 },
    );
  }

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
    const raw = {
      site_config: siteConfig ?? null,
      home_hero: homeHero ?? null,
      section_banners: sectionBanners ?? null,
      branches: branches ?? null,
      retailers: retailers ?? null,
      spotlights: spotlights ?? null,
    };
    if (auth.tabs === "all") {
      return NextResponse.json(raw);
    }
    const t = new Set(auth.tabs);
    return NextResponse.json(
      pickCmsBundle(raw, (k) => {
        if (k === "site_config") {
          return t.has("general") || t.has("branding");
        }
        if (k === "home_hero") return t.has("hero");
        if (k === "section_banners") return t.has("banners");
        if (k === "branches") return t.has("branches");
        if (k === "retailers") return t.has("retailers");
        if (k === "spotlights") return t.has("spotlights");
        return false;
      }),
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Read failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireControlSession(request);
  if (auth instanceof NextResponse) return auth;
  if (auth.scope === "media") {
    return NextResponse.json(
      { error: "ليس لديك صلاحية تعديل إعدادات CMS" },
      { status: 403 },
    );
  }

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
  const denied = requireCmsPutKey(auth, putKey);
  if (denied) {
    return denied;
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
