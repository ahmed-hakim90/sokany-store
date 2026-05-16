import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const firestoreDoc = {
  fawry: {
    enabled: true,
    merchantCode: "firestore-merchant",
    secureKey: "firestore-secure",
    hostedPaymentMethod: "CARD",
    sandbox: false,
  },
};

vi.mock("@/lib/firebase-admin", () => ({
  getAdminFirestore: () => ({
    collection: () => ({
      doc: () => ({
        get: async () => ({
          exists: true,
          data: () => firestoreDoc,
        }),
      }),
    }),
  }),
}));

describe("resolveFawryConfig", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("applies FAWRY_HOSTED_PAYMENT_METHOD over Firestore config", async () => {
    vi.stubEnv("FIREBASE_SERVICE_ACCOUNT_JSON", "{}");
    vi.stubEnv("FAWRY_HOSTED_PAYMENT_METHOD", "PayAtFawry");
    vi.stubEnv("FAWRY_MERCHANT_CODE", "");
    vi.stubEnv("FAWRY_SECURE_KEY", "");
    vi.stubEnv("FAWRY_SECRET_KEY", "");

    const { resolveFawryConfig } = await import("@/lib/payment-gateways-store");
    const config = await resolveFawryConfig();

    expect(config).toMatchObject({
      merchantCode: "firestore-merchant",
      secureKey: "firestore-secure",
      hostedPaymentMethod: "PayAtFawry",
    });
  });

  it("reads the Firestore hosted payment method when env does not override it", async () => {
    vi.stubEnv("FIREBASE_SERVICE_ACCOUNT_JSON", "{}");
    vi.stubEnv("FAWRY_HOSTED_PAYMENT_METHOD", "");
    vi.stubEnv("FAWRY_MERCHANT_CODE", "");
    vi.stubEnv("FAWRY_SECURE_KEY", "");
    vi.stubEnv("FAWRY_SECRET_KEY", "");

    const { resolveFawryConfig } = await import("@/lib/payment-gateways-store");
    const config = await resolveFawryConfig();

    expect(config).toMatchObject({
      merchantCode: "firestore-merchant",
      secureKey: "firestore-secure",
      hostedPaymentMethod: "CARD",
    });
  });
});
