export type PublicKnowledgeKind =
  | "product"
  | "category"
  | "cms"
  | "branch"
  | "retailer"
  | "policy"
  | "page";

export type PublicKnowledgeChunk = {
  id: string;
  title: string;
  url: string;
  kind: PublicKnowledgeKind;
  text: string;
};

export type AssistantSource = {
  title: string;
  url: string;
  kind: PublicKnowledgeKind;
};

export type AssistantProductCard = {
  id: number;
  name: string;
  url: string;
  thumbnail: string;
  price: string;
  regularPrice?: string;
  salePrice?: string;
  onSale: boolean;
  inStock: boolean;
  badge?: string;
  reason?: string;
};

export type AssistantPageContext = {
  pathname: string;
  pageType:
    | "home"
    | "product"
    | "category"
    | "cart"
    | "checkout"
    | "search"
    | "policy"
    | "branches"
    | "retailers"
    | "unknown";
  productId?: number;
  categorySlug?: string;
};

export type AssistantDataTypes = {
  sources: AssistantSource[];
  products: AssistantProductCard[];
  quickActions: string[];
};
