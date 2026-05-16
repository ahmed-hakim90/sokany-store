import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

const mockSet = vi.fn(async () => undefined);

vi.mock("firebase-admin", () => ({
  default: {
    firestore: {
      FieldValue: {
        serverTimestamp: () => ({ __type: "serverTimestamp" }),
        delete: () => ({ __type: "delete" }),
      },
    },
  },
}));

vi.mock("@/lib/firebase-admin", () => ({
  getAdminFirestore: () => ({
    collection: () => ({
      doc: () => ({
        get: async () => ({
          exists: true,
          data: () => firestoreDoc,
        }),
        set: mockSet,
      }),
    }),
  }),
}));

describe("buildGatewayConfigForFirestore", () => {
  it("omits undefined fields", async () => {
    const { buildGatewayConfigForFirestore } = await import("@/lib/payment-gateways-store");
    const result = buildGatewayConfigForFirestore({
      enabled: false,
      merchantCode: "merchant",
      secureKey: "secret",
      hostedPaymentMethod: undefined,
      sandbox: false,
    });

    expect(result).toEqual({
      enabled: false,
      merchantCode: "merchant",
      secureKey: "secret",
      sandbox: false,
    });
    expect(result).not.toHaveProperty("hostedPaymentMethod");
  });

  it("applies hostedPaymentMethodField sentinel when clearing", async () => {
    const { buildGatewayConfigForFirestore } = await import("@/lib/payment-gateways-store");
    const deleteSentinel = { __type: "delete" };
    const result = buildGatewayConfigForFirestore(
      {
        enabled: false,
        merchantCode: "merchant",
        secureKey: "secret",
        sandbox: false,
      },
      { hostedPaymentMethodField: deleteSentinel },
    );

    expect(result.hostedPaymentMethod).toBe(deleteSentinel);
  });
});

describe("savePaymentGateways", () => {
  beforeEach(() => {
    mockSet.mockClear();
    vi.stubEnv("FIREBASE_SERVICE_ACCOUNT_JSON", "{}");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("writes disabled fawry without undefined and clears hostedPaymentMethod", async () => {
    const { savePaymentGateways } = await import("@/lib/payment-gateways-store");

    await savePaymentGateways(
      {
        fawry: {
          enabled: false,
          merchantCode: "merchant",
          secureKey: "secret",
          sandbox: false,
        },
        fawryClearHostedPaymentMethod: true,
      },
      "uid-test",
    );

    expect(mockSet).toHaveBeenCalledOnce();
    const [payload, options] = mockSet.mock.calls[0] as [
      Record<string, unknown>,
      { merge: boolean },
    ];
    expect(options).toEqual({ merge: true });
    expect(payload.updatedByUid).toBe("uid-test");
    expect(payload.fawry).toMatchObject({
      enabled: false,
      merchantCode: "merchant",
      secureKey: "secret",
      sandbox: false,
      hostedPaymentMethod: { __type: "delete" },
    });
    expect(JSON.stringify(payload)).not.toContain("undefined");
  });
});

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
