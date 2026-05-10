import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { GET as getProducts } from "@/app/api/products/route";
import { GET as getCategories } from "@/app/api/categories/route";

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (key: string) => Promise<unknown>) => fn,
}));

const mockFetchProductsPage = vi.fn();

vi.mock("@/features/products/services/woo-storefront-product-page", () => ({
  fetchWooStorefrontProductsPage: (...args: unknown[]) => mockFetchProductsPage(...args),
}));

const mockCreateWoo = vi.fn();
vi.mock("@/lib/create-woo-client", () => ({
  createWooClient: () => mockCreateWoo(),
}));

describe("GET /api/products", () => {
  beforeEach(() => {
    mockFetchProductsPage.mockReset();
    mockCreateWoo.mockReset();
    mockCreateWoo.mockResolvedValue({});
  });

  it("returns JSON array and pagination headers from Woo layer", async () => {
    mockFetchProductsPage.mockResolvedValue({
      data: [{ id: 1, name: "A" }],
      total: "1",
      totalPages: "1",
    });
    const req = new NextRequest("http://localhost/api/products?page=1&per_page=10");
    const res = await getProducts(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("X-WP-Total")).toBe("1");
    const body = (await res.json()) as unknown[];
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
    expect((body[0] as { id: number }).id).toBe(1);
  });
});

const mockWooGet = vi.fn();

describe("GET /api/categories", () => {
  beforeEach(() => {
    mockWooGet.mockReset();
    mockCreateWoo.mockReset();
    mockCreateWoo.mockResolvedValue({
      get: mockWooGet,
    });
  });

  it("proxies Woo categories list with totals", async () => {
    mockWooGet.mockResolvedValue({
      data: [{ id: 2, slug: "kitchen", name: "Kitchen" }],
      headers: { "x-wp-total": "5", "x-wp-totalpages": "1" },
    });
    const req = new NextRequest("http://localhost/api/categories");
    const res = await getCategories(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("X-WP-Total")).toBe("5");
    const body = (await res.json()) as unknown[];
    expect(body).toHaveLength(1);
    expect(mockWooGet).toHaveBeenCalledWith("/products/categories", { params: {} });
  });
});
