import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { extractFawryHostedRedirectUrl, initiateFawryCharge } from "@/lib/payment/fawry";
import {
  buildFawryHostedSignature,
  buildFawryReferenceSignature,
} from "@/lib/payment/fawry-signature";

describe("initiateFawryCharge", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("signs PayAtFawry reference-code requests with paymentMethod and amount", async () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    let outboundBody: Record<string, unknown> | undefined;
    const fetchMock = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      outboundBody = JSON.parse(String(init?.body));
      return new Response(
        JSON.stringify({
          statusCode: 200,
          redirectUrl: "https://atfawry.fawrystaging.com/checkout/ref-123",
          referenceNumber: "963455678",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    await initiateFawryCharge(
      {
        enabled: true,
        merchantCode: "merchant-code",
        secureKey: "secure-key",
        sandbox: true,
      },
      {
        merchantRefNum: "ref-123",
        customerName: "Test Customer",
        customerMobile: "01000000000",
        customerEmail: "test@example.com",
        customerProfileId: "profile-9",
        returnUrl: "https://sokany-eg.com/api/payments/fawry/callback?ref=ref-123",
        paymentMethod: "PayAtFawry",
        paymentExpiry: 1_771_234_567_890,
        chargeItems: [
          { itemId: "sku-12", description: "First", price: 50.25, quantity: 2 },
          { itemId: "sku-99", description: "Second", price: 10, quantity: 1 },
        ],
      },
    );

    expect(outboundBody?.signature).toBe(buildFawryReferenceSignature({
      merchantCode: "merchant-code",
      merchantRefNum: "ref-123",
      customerProfileId: "profile-9",
      paymentMethod: "PayAtFawry",
      amount: "110.50",
      secureKey: "secure-key",
    }));
    expect(outboundBody?.merchantRefNum).toBe("ref-123");
    expect(outboundBody?.paymentMethod).toBe("PayAtFawry");
    expect(outboundBody?.amount).toBe("110.50");
    expect(outboundBody).not.toHaveProperty("currencyCode");
    expect(outboundBody?.paymentExpiry).toBe(1_771_234_567_890);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://atfawry.fawrystaging.com/ECommerceWeb/Fawry/payments/charge",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("omits paymentMethod when the hosted request is not restricted", async () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    let outboundBody: Record<string, unknown> | undefined;
    vi.stubGlobal("fetch", vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      outboundBody = JSON.parse(String(init?.body));
      return new Response(
        JSON.stringify({
          statusCode: 200,
          nextAction: { redirectUrl: "https://atfawry.fawrystaging.com/checkout/ref-456" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }));

    const result = await initiateFawryCharge(
      {
        enabled: true,
        merchantCode: "merchant-code",
        secureKey: "secure-key",
        sandbox: true,
      },
      {
        merchantRefNum: "ref-456",
        customerName: "Test Customer",
        customerMobile: "01000000000",
        customerEmail: "test@example.com",
        returnUrl: "https://sokany-eg.com/api/payments/fawry/callback?ref=ref-456",
        chargeItems: [
          { itemId: "sku-12", description: "First", price: 10, quantity: 1 },
        ],
      },
    );

    expect(outboundBody?.signature).toBe(buildFawryHostedSignature({
      merchantCode: "merchant-code",
      merchantRefNum: "ref-456",
      returnUrl: "https://sokany-eg.com/api/payments/fawry/callback?ref=ref-456",
      chargeItems: [
        { itemId: "sku-12", price: 10, quantity: 1 },
      ],
      secureKey: "secure-key",
    }));
    expect(outboundBody).not.toHaveProperty("paymentMethod");
    expect(outboundBody).not.toHaveProperty("amount");
    expect(result.redirectUrl).toBe("https://atfawry.fawrystaging.com/checkout/ref-456");
  });

  it("accepts PayAtFawry responses with only a reference number", async () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.stubGlobal("fetch", vi.fn(async () => new Response(
      JSON.stringify({
        statusCode: 200,
        referenceNumber: "963455679",
        merchantRefNumber: "ref-789",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )));

    const result = await initiateFawryCharge(
      {
        enabled: true,
        merchantCode: "merchant-code",
        secureKey: "secure-key",
        sandbox: true,
      },
      {
        merchantRefNum: "ref-789",
        customerName: "Test Customer",
        customerMobile: "01000000000",
        customerEmail: "test@example.com",
        returnUrl: "https://sokany-eg.com/api/payments/fawry/callback?ref=ref-789",
        paymentMethod: "PayAtFawry",
        chargeItems: [
          { itemId: "sku-12", description: "First", price: 10, quantity: 1 },
        ],
      },
    );

    expect(result.redirectUrl).toBeUndefined();
    expect(result.referenceNumber).toBe("963455679");
    expect(result.merchantRefNum).toBe("ref-789");
    expect(result.paymentMethod).toBe("PayAtFawry");
  });

  it("extracts hosted redirect URL aliases from passthrough response shapes", () => {
    expect(extractFawryHostedRedirectUrl({
      statusCode: 200,
      result: { checkout_url: "https://atfawry.fawrystaging.com/checkout/alias" },
    })).toBe("https://atfawry.fawrystaging.com/checkout/alias");
  });
});
