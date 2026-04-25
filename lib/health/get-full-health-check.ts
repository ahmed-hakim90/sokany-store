import "server-only";

import { WOO_WEBHOOK_DELIVERIES_COLLECTION } from "@/features/woocommerce/lib/firestore-collections";
import { getAdminFirestore } from "@/lib/firebase-admin";
import type { WooDiagnosticReport } from "@/lib/woo-diagnostics";
import { getWooDiagnosticReport } from "@/lib/woo-diagnostics";

export type FirestoreProbe = {
  ok: boolean;
  latencyMs: number;
  error?: string;
  enabled: boolean;
};

function computeHealthScore(input: {
  firestore: FirestoreProbe;
  report: WooDiagnosticReport;
}): { score: number; label: "ok" | "degraded" | "down" } {
  const parts: number[] = [];
  if (input.firestore.enabled) {
    parts.push(input.firestore.ok ? 1 : 0);
  }
  if (input.report.wooEnvConfigured) {
    parts.push(
      input.report.products.ok && input.report.products.httpStatus != null ? 1 : 0,
    );
    parts.push(input.report.products.schemaOk ? 1 : 0);
  }
  const denom = parts.length;
  const score = denom > 0 ? Math.round((parts.reduce((a, b) => a + b, 0) / denom) * 100) : 0;
  if (score >= 85) return { score, label: "ok" };
  if (score >= 50) return { score, label: "degraded" };
  return { score, label: "down" };
}

/**
 * (A) ‎Firestore ‎(B)+(C) ‎Woo + ‎Zod ‎عبر ‎`getWooDiagnosticReport`‎.
 */
export async function getFullHealthCheck(): Promise<{
  at: string;
  firestore: FirestoreProbe;
  woo: WooDiagnosticReport;
  healthScore: number;
  healthLabel: "ok" | "degraded" | "down";
}> {
  const at = new Date().toISOString();
  const firestore: FirestoreProbe = { ok: false, latencyMs: 0, enabled: false };

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    firestore.enabled = true;
    const t0 = Date.now();
    try {
      const db = getAdminFirestore();
      await db.collection(WOO_WEBHOOK_DELIVERIES_COLLECTION).limit(1).get();
      firestore.ok = true;
      firestore.latencyMs = Date.now() - t0;
    } catch (e) {
      firestore.ok = false;
      firestore.latencyMs = Date.now() - t0;
      firestore.error = e instanceof Error ? e.message : "Firestore probe failed";
    }
  } else {
    firestore.error = "FIREBASE_SERVICE_ACCOUNT_JSON غير مضبوط";
  }

  const report = await getWooDiagnosticReport();
  const { score, label } = computeHealthScore({ firestore, report });

  return {
    at,
    firestore,
    woo: report,
    healthScore: score,
    healthLabel: label,
  };
}
