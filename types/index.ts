export type ProductQueryParams = {
  page?: number;
  per_page?: number;
  featured?: boolean;
  category?: number;
  include_children?: boolean;
  search?: string;
  slug?: string;
  /** WooCommerce list: date | popularity | price | rating | title */
  orderby?: string;
  order?: "asc" | "desc";
  /** WooCommerce v3+ list filters (ignored by older stores) */
  min_price?: number;
  max_price?: number;
};

export type CategoryQueryParams = {
  page?: number;
  per_page?: number;
  slug?: string;
  parent?: number;
};
