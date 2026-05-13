import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { initiateFawryCharge } from "@/lib/payment/fawry";

describe("initiateFawryCharge", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("signs charge requests with Fawry's documented field order", async () => {
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

    expect(outboundBody?.signature).toBe(
      "6128097443c38c1c9096825e63f7a4a51abc25168df3723feb3dbd9e91d76816",
    );
    expect(outboundBody).not.toHaveProperty("amount");
    expect(outboundBody?.merchantRefNum).toBe("ref-123");
    expect(outboundBody?.paymentMethod).toBe("PayAtFawry");
    expect(outboundBody).not.toHaveProperty("currencyCode");
    expect(outboundBody?.paymentExpiry).toBe(1_771_234_567_890);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://atfawry.fawrystaging.com/ECommerceWeb/Fawry/payments/charge",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
