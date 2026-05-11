import { NextRequest, NextResponse } from "next/server";
import { requireScopeFull, requireSuperAdminSession } from "@/lib/api-control-auth";
import { maskWooKeyFragment } from "@/lib/mask-woo-credential";
import {
  getEncryptedWooCredentialsStatus,
  resolveWooCredentialsForServer,
  saveEncryptedWooCredentials,
  wooCredentialsInputSchema,
} from "@/lib/woo-credentials-store";

export const runtime = "nodejs";

async function buildCredentialStatus() {
  const [resolved, encrypted] = await Promise.all([
    resolveWooCredentialsForServer().catch(() => null),
    getEncryptedWooCredentialsStatus(),
  ]);
  return {
    hasConsumerKey: Boolean(resolved?.consumerKey),
    hasConsumerSecret: Boolean(resolved?.consumerSecret),
    consumerKeyDisplay: maskWooKeyFragment(resolved?.consumerKey),
    source: resolved?.source ?? null,
    encryptedCredentialsSaved: encrypted.exists,
    encryptionConfigured: encrypted.canDecrypt,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireScopeFull(request);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json(await buildCredentialStatus());
}

export async function PUT(request: NextRequest) {
  const auth = await requireSuperAdminSession(request);
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

  const parsed = wooCredentialsInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await saveEncryptedWooCredentials(parsed.data, auth.uid);
    return NextResponse.json({ ok: true, credentials: await buildCredentialStatus() });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Write failed";
    const status = message.includes("WOO_CREDENTIALS_ENCRYPTION_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
