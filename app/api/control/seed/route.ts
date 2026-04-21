import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { revalidateTag } from "next/cache";
import { branchesData } from "@/features/branches/data";
import { CMS_DOC_IDS, STOREFRONT_CMS_COLLECTION } from "@/features/cms/lib/collections";
import { CMS_CACHE_TAG } from "@/features/cms/services/getPublicSiteContent";
import {
  authorizedRetailers,
  retailersMapHeroSrc,
} from "@/features/retailers/data";
import { requireControlSession } from "@/lib/api-control-auth";
import { getAdminFirestore } from "@/lib/firebase-admin";

export const runtime = "nodejs";

/** يملأ مستندات الفروع والموزعين من البيانات الثابتة في الكود. */
export async function POST(request: NextRequest) {
  const auth = await requireControlSession(request);
  if (auth instanceof NextResponse) return auth;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
  }

  const ts = admin.firestore.FieldValue.serverTimestamp();
  try {
    const db = getAdminFirestore();
    const col = db.collection(STOREFRONT_CMS_COLLECTION);
    await col.doc(CMS_DOC_IDS.branches).set(
      {
        sales: [...branchesData.sales],
        service: [...branchesData.service],
        updatedAt: ts,
      },
      { merge: true },
    );
    await col.doc(CMS_DOC_IDS.retailers).set(
      {
        retailers: [...authorizedRetailers],
        mapHeroSrc: retailersMapHeroSrc,
        updatedAt: ts,
      },
      { merge: true },
    );
    revalidateTag(CMS_CACHE_TAG, "max");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
