import { describe, expect, it } from "vitest";
import { detectAssistantIntent } from "@/features/assistant/lib/assistant-intents";

describe("detectAssistantIntent", () => {
  it("detects branch questions", () => {
    expect(detectAssistantIntent("فين فروع الصيانة؟")).toBe("branches");
  });

  it("detects lowest price questions", () => {
    expect(detectAssistantIntent("اقل سعر خلاط؟")).toBe("lowestPrice");
  });

  it("detects recommendation questions", () => {
    expect(detectAssistantIntent("رشحلي خلاط اقتصادي")).toBe(
      "productRecommendation",
    );
  });

  it("uses product page context for vague product questions", () => {
    expect(
      detectAssistantIntent("هل ده مناسب لي؟", {
        pathname: "/products/123",
        pageType: "product",
        productId: 123,
      }),
    ).toBe("productDetails");
  });
});
