export type WCProductImage = {
  id: number;
  src: string;
  name: string;
  alt: string;
};

export type WCProductCategory = {
  id: number;
  name: string;
  slug: string;
};

export type WCProductTag = {
  id: number;
  name: string;
  slug: string;
};

export type WCProductAttribute = {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
};

export type WCProduct = {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_modified: string;
  type: string;
  status: string;
  featured: boolean;
  catalog_visibility: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: "instock" | "outofstock" | "onbackorder";
  backorders: string;
  backorders_allowed: boolean;
  backordered: boolean;
  images: WCProductImage[];
  categories: WCProductCategory[];
  tags: WCProductTag[];
  attributes: WCProductAttribute[];
  average_rating: string;
  rating_count: number;
  meta_data: unknown[];
};

export type ProductImage = {
  id: number;
  src: string;
  alt: string;
};

/** Normalized product for UI / cart (see `mapProduct` in adapters) */
export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  sku: string;
  price: number;
  regularPrice: number;
  salePrice: number | null;
  onSale: boolean;
  inStock: boolean;
  stockQuantity: number | null;
  featured: boolean;
  images: ProductImage[];
  thumbnail: string;
  categories: { id: number; name: string; slug: string }[];
  rating: number;
  ratingCount: number;
  permalink: string;
};
