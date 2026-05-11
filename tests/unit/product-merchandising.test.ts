import { describe, expect, it } from "vitest";
import { getProductVideoEmbed } from "@/features/products/lib/product-merchandising";
import type { Product } from "@/features/products/types";

function makeProduct(overrides: Partial<Product>): Product {
  return {
    id: 1,
    name: "Test product",
    slug: "test-product",
    description: "",
    shortDescription: "",
    sku: "",
    price: 0,
    regularPrice: 0,
    salePrice: null,
    onSale: false,
    inStock: true,
    stockQuantity: null,
    featured: false,
    images: [],
    thumbnail: "",
    categories: [],
    rating: 0,
    ratingCount: 0,
    dateCreated: "2026-01-01T00:00:00",
    totalSales: 0,
    permalink: "https://example.com/product/test-product/",
    tags: [],
    attributes: [],
    relatedIds: [],
    metaData: [],
    ...overrides,
  };
}

describe("getProductVideoEmbed", () => {
  it("ignores Elementor's default placeholder YouTube video", () => {
    const product = makeProduct({
      description:
        '<div class="elementor-widget-video"><a href="https://www.youtube.com/watch?v=XHOmBV4js_E">video</a></div>',
    });

    expect(getProductVideoEmbed(product)).toBeNull();
  });

  it("keeps real YouTube product videos", () => {
    const product = makeProduct({
      description: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });

    expect(getProductVideoEmbed(product)).toMatchObject({
      kind: "iframe",
      sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      title: "فيديو المنتج على يوتيوب",
    });
  });

  it("skips placeholders and uses the next real product video", () => {
    const product = makeProduct({
      metaData: [
        { key: "_elementor_placeholder_video", value: "https://youtu.be/XHOmBV4js_E" },
        { key: "product_video", value: "https://cdn.example.com/product-demo.mp4" },
      ],
    });

    expect(getProductVideoEmbed(product)).toMatchObject({
      kind: "video",
      sourceUrl: "https://cdn.example.com/product-demo.mp4",
    });
  });
});
