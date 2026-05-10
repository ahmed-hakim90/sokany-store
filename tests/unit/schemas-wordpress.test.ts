import { describe, expect, it } from "vitest";
import { wpCategorySchema, wpImageSchema, wpProductSchema } from "@/schemas/wordpress";

describe("wpCategorySchema", () => {
  it("parses minimal category", () => {
    const row = {
      id: 5,
      name: "Kitchen",
      slug: "kitchen",
      parent: 0,
      count: 12,
    };
    const out = wpCategorySchema.parse(row);
    expect(out.id).toBe(5);
    expect(out.slug).toBe("kitchen");
    expect(out.count).toBe(12);
  });
});

describe("wpImageSchema", () => {
  it("accepts https URL", () => {
    const img = wpImageSchema.parse({
      id: 1,
      src: "https://example.com/x.jpg",
      name: "",
      alt: "A",
    });
    expect(img.src).toMatch(/^https:/);
  });

  it("accepts absolute path for local snapshots", () => {
    const img = wpImageSchema.parse({
      id: 2,
      src: "/images/sokany-eg/p.jpg",
      name: "",
      alt: "",
    });
    expect(img.src.startsWith("/")).toBe(true);
  });
});

describe("wpProductSchema", () => {
  it("parses a compact purchasable product", () => {
    const row = {
      id: 99,
      name: "Blender",
      slug: "blender",
      permalink: "https://shop.example.com/product/blender/",
      date_created: "2020-01-01T00:00:00",
      date_modified: "2020-01-02T00:00:00",
      type: "simple",
      status: "publish",
      featured: false,
      catalog_visibility: "visible",
      description: "",
      short_description: "",
      sku: "",
      price: "199",
      regular_price: "199",
      sale_price: "",
      on_sale: false,
      purchasable: true,
      stock_status: "instock" as const,
      average_rating: "0",
      images: [],
      categories: [],
      attributes: [],
      meta_data: [],
    };
    const p = wpProductSchema.parse(row);
    expect(p.id).toBe(99);
    expect(p.stock_status).toBe("instock");
  });
});
