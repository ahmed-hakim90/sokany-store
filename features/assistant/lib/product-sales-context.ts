import "server-only";

import { getProductsListServer } from "@/features/products/services/getProductsServer";
import type { Product } from "@/features/products/types";
import { formatCurrency } from "@/lib/format";
import { ROUTES } from "@/lib/constants";
import type { PublicKnowledgeChunk } from "@/features/assistant/types";

const MAX_CROSS_SELL_ITEMS = 2;

function productIdFromChunk(chunk: PublicKnowledgeChunk): number | null {
  if (chunk.kind !== "product") return null;
  const match = chunk.id.match(/^product-(\d+)$/);
  if (!match) return null;
  const id = Number.parseInt(match[1] ?? "", 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

async function fetchProductsByIds(ids: number[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const { products } = await getProductsListServer({
    include: ids.join(","),
    per_page: Math.min(100, Math.max(1, ids.length)),
  });
  return products;
}

async function fetchSameCategoryProducts(product: Product): Promise<Product[]> {
  const categoryId = product.categories[0]?.id;
  if (!categoryId) return [];
  const { products } = await getProductsListServer({
    category: categoryId,
    include_children: true,
    per_page: 8,
    orderby: "popularity",
    order: "desc",
  });
  return products;
}

function productLine(product: Product): string {
  const saleNote = product.onSale ? "عليه عرض" : "متاح";
  return `${product.name} بسعر ${formatCurrency(product.price)} (${saleNote}) - الرابط: ${ROUTES.PRODUCT(product.id)}`;
}

function salesBenefits(product: Product): string {
  const categories = product.categories.map((category) => category.name).join("، ");
  const attrs = product.attributes
    .filter((attribute) => attribute.visible)
    .slice(0, 3)
    .map((attribute) => `${attribute.name}: ${attribute.options.slice(0, 3).join("، ")}`)
    .join("؛ ");
  return [
    `اقنع العميل بالشراء باختصار: ${product.name} مناسب لمن يبحث عن ${categories || "منتج سوكاني عملي"}.`,
    attrs ? `أبرز المواصفات: ${attrs}.` : "",
    `السعر الحالي العام: ${formatCurrency(product.price)}. الرابط: ${ROUTES.PRODUCT(product.id)}.`,
    product.onSale ? "اذكر أنه ضمن العروض بدون مبالغة." : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export async function buildProductSalesContextChunks(
  retrievedChunks: PublicKnowledgeChunk[],
): Promise<PublicKnowledgeChunk[]> {
  const primaryIds = [
    ...new Set(retrievedChunks.map(productIdFromChunk).filter((id): id is number => id != null)),
  ].slice(0, 3);
  if (primaryIds.length === 0) return [];

  const primaryProducts = (await fetchProductsByIds(primaryIds)).filter(
    (product) => product.inStock && product.price > 0,
  );
  const primary = primaryProducts[0];
  if (!primary) return [];

  const relatedIds = primary.relatedIds.filter((id) => id !== primary.id).slice(0, 8);
  const relatedProducts = relatedIds.length > 0 ? await fetchProductsByIds(relatedIds) : [];
  const fallbackProducts =
    relatedProducts.length > 0 ? [] : await fetchSameCategoryProducts(primary);
  const crossSell = [...relatedProducts, ...fallbackProducts]
    .filter((product) => product.id !== primary.id)
    .filter((product) => product.inStock && product.price > 0)
    .slice(0, MAX_CROSS_SELL_ITEMS);

  const text = [
    salesBenefits(primary),
    crossSell.length > 0
      ? `Cross-sell مناسب: ${crossSell.map(productLine).join(" | ")}`
      : "لو لا توجد منتجات مكملة في السياق، لا تخترع cross-sell.",
  ].join(" ");

  return [
    {
      id: `product-sales-${primary.id}`,
      kind: "product",
      title: `بيع واقتراحات مكملة: ${primary.name}`,
      url: ROUTES.PRODUCT(primary.id),
      text,
    },
    ...crossSell.map<PublicKnowledgeChunk>((product) => ({
      id: `product-cross-sell-${product.id}`,
      kind: "product",
      title: `اقتراح مكمل: ${product.name}`,
      url: ROUTES.PRODUCT(product.id),
      text: productLine(product),
    })),
  ];
}
