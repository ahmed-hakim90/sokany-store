export type ProductQueryParams = {
  page?: number;
  per_page?: number;
  featured?: boolean;
  category?: number;
  search?: string;
  slug?: string;
};

export type CategoryQueryParams = {
  page?: number;
  per_page?: number;
  slug?: string;
  parent?: number;
};
