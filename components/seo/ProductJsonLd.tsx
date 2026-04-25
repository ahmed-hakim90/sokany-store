import type { ProductView } from "@/features/products/product-view";

type Props = { product: ProductView };

const DEFAULT_PRICE_VALID_UNTIL = "2030-12-31";

export function ProductJsonLd({ product }: Props) {
  const priceValidUntil = DEFAULT_PRICE_VALID_UNTIL;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((img) => img.src),
    description: product.descriptionPlain || product.shortDescriptionPlain,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: "SOKANY",
    },
    offers: {
      "@type": "Offer",
      url: product.permalink,
      priceCurrency: "EGP",
      price: product.price,
      priceValidUntil,
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "مؤسسة المغربى",
      },
    },
  };

  if (product.ratingCount > 0 && product.rating > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
