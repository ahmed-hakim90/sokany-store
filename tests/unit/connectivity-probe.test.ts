import { describe, expect, it, vi } from "vitest";
import {
  probeStorefrontConnectivity,
  STOREFRONT_CONNECTIVITY_PROBE_URL,
} from "@/lib/connectivity-probe";

describe("probeStorefrontConnectivity", () => {
  it("returns true when HEAD succeeds", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });
    await expect(probeStorefrontConnectivity(fetchImpl)).resolves.toBe(true);
    expect(fetchImpl).toHaveBeenCalledWith(
      STOREFRONT_CONNECTIVITY_PROBE_URL,
      expect.objectContaining({ method: "HEAD", cache: "no-store" }),
    );
  });

  it("returns false when fetch throws", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network"));
    await expect(probeStorefrontConnectivity(fetchImpl)).resolves.toBe(false);
  });

  it("returns false when response is not ok", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false });
    await expect(probeStorefrontConnectivity(fetchImpl)).resolves.toBe(false);
  });
});
