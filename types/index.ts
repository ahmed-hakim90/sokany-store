export type ProductQueryParams = {
  page?: number;
  per_page?: number;
  featured?: boolean;
  /** WooCommerce: only products currently on sale */
  on_sale?: boolean;
  category?: number;
  include_children?: boolean;
  search?: string;
  slug?: string;
  /** WooCommerce list: date | popularity | price | rating | title | rand */
  orderby?: string;
  order?: "asc" | "desc";
  /** WooCommerce v3+ list filters (ignored by older stores) */
  min_price?: number;
  max_price?: number;
  /** Comma-separated product IDs (`include=1,2,3`) for related / manual sets */
  include?: string;
};

export type CategoryQueryParams = {
  page?: number;
  per_page?: number;
  slug?: string;
  parent?: number;
};
