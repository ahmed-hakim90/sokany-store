export type WCCategoryImage = {
  id: number;
  src: string;
  alt: string;
};

export type WCCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  display: string;
  image: WCCategoryImage | null;
  parent: number;
  count: number;
  _links: Record<string, unknown>;
};

/** Normalized category for UI (see `mapCategory` in adapters) */
export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  count: number;
  parentId: number;
  /** Unmodelled top-level fields from Woo `products/categories` (passthrough). */
  wooExcess?: Record<string, unknown>;
};
