import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const revalidatePath = vi.fn();
const revalidateTag = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
  revalidateTag: (...args: unknown[]) => revalidateTag(...args),
}));

import { revalidateAfterWooCommerceWebhook } from "@/features/woocommerce/revalidate-after-product-webhook";
import {
  WOO_CACHE_TAG_ORDERS,
  WOO_CACHE_TAG_PRODUCT_TAGS,
  WOO_CACHE_TAG_PRODUCTS,
  WOO_CACHE_TAG_REVIEWS,
  WOO_CACHE_TAG_SITEMAP,
  wooCategorySlugTag,
  wooProductDetailTag,
  wooProductSlugTag,
} from "@/lib/woocommerce-cache-tags";
import { ROUTES } from "@/lib/constants";

describe("revalidateAfterWooCommerceWebhook", () => {
  beforeEach(() => {
    revalidatePath.mockClear();
    revalidateTag.mockClear();
  });

  it("keeps order webhooks away from product cache invalidation", () => {
    revalidateAfterWooCommerceWebhook("order.created", { id: 124749 });

    expect(revalidateTag).toHaveBeenCalledWith(WOO_CACHE_TAG_ORDERS, "max");
    expect(revalidateTag).toHaveBeenCalledWith(WOO_CACHE_TAG_REVIEWS, "max");
    expect(revalidateTag).not.toHaveBeenCalledWith(WOO_CACHE_TAG_PRODUCTS, "max");
    expect(revalidateTag).not.toHaveBeenCalledWith(WOO_CACHE_TAG_PRODUCT_TAGS, "max");
    expect(revalidateTag).not.toHaveBeenCalledWith(WOO_CACHE_TAG_SITEMAP, "max");

    expect(revalidatePath).toHaveBeenCalledWith(ROUTES.ORDER_TRACKING);
    expect(revalidatePath).toHaveBeenCalledWith(ROUTES.MY_ORDERS);
    expect(revalidatePath).toHaveBeenCalledWith(ROUTES.MY_REVIEWS);
    expect(revalidatePath).toHaveBeenCalledWith(ROUTES.ACCOUNT);
    expect(revalidatePath).not.toHaveBeenCalledWith("/");
  });

  it("invalidates product cache and only the specific product path", () => {
    revalidateAfterWooCommerceWebhook("product.updated", {
      id: 73746,
      slug: "sokany-blender",
      categories: [{ slug: "blenders" }, { slug: "kitchen" }],
    });

    expect(revalidateTag).toHaveBeenCalledWith(WOO_CACHE_TAG_PRODUCTS, "max");
    expect(revalidateTag).toHaveBeenCalledWith(WOO_CACHE_TAG_PRODUCT_TAGS, "max");
    expect(revalidateTag).toHaveBeenCalledWith(WOO_CACHE_TAG_SITEMAP, "max");
    expect(revalidateTag).toHaveBeenCalledWith(wooProductDetailTag(73746), "max");
    expect(revalidateTag).toHaveBeenCalledWith(
      wooProductSlugTag("sokany-blender"),
      "max",
    );
    expect(revalidateTag).toHaveBeenCalledWith(
      wooCategorySlugTag("blenders"),
      "max",
    );
    expect(revalidateTag).toHaveBeenCalledWith(
      wooCategorySlugTag("kitchen"),
      "max",
    );
    expect(revalidateTag).not.toHaveBeenCalledWith(WOO_CACHE_TAG_ORDERS, "max");
    expect(revalidateTag).not.toHaveBeenCalledWith(WOO_CACHE_TAG_REVIEWS, "max");

    expect(revalidatePath).toHaveBeenCalledWith("/products/73746");
    expect(revalidatePath).not.toHaveBeenCalledWith("/");
    expect(revalidatePath).not.toHaveBeenCalledWith("/offers");
    expect(revalidatePath).not.toHaveBeenCalledWith("/search");
    expect(revalidatePath).not.toHaveBeenCalledWith("/categories");
  });

  it("keeps category webhooks scoped to category caches and category pages", () => {
    revalidateAfterWooCommerceWebhook("product_cat.updated", {
      id: 12,
      slug: "coffee-makers",
    });

    expect(revalidateTag).toHaveBeenCalledWith(WOO_CACHE_TAG_PRODUCTS, "max");
    expect(revalidateTag).toHaveBeenCalledWith(WOO_CACHE_TAG_PRODUCT_TAGS, "max");
    expect(revalidateTag).toHaveBeenCalledWith(WOO_CACHE_TAG_SITEMAP, "max");
    expect(revalidateTag).toHaveBeenCalledWith(
      wooCategorySlugTag("coffee-makers"),
      "max",
    );

    expect(revalidatePath).toHaveBeenCalledWith("/categories", "page");
    expect(revalidatePath).toHaveBeenCalledWith("/categories", "layout");
    expect(revalidatePath).not.toHaveBeenCalledWith("/");
    expect(revalidatePath).not.toHaveBeenCalledWith("/products");
  });
});
