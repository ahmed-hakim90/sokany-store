import type { ProductView } from "@/features/products/product-view";
import { getSiteUrl } from "@/lib/site";

type Props = {
  product: ProductView;
  /** Public product line / trademark for `brand` — defaults to SOKANY. */
  brandName?: string;
  /** Legal seller for `offers.seller` — defaults to Arabic storefront org label. */
  sellerName?: string;
};

const DEFAULT_BRAND_NAME = "SOKANY";
const DEFAULT_SELLER_NAME = "مؤسسة المغربى";

/** Rolling window for Offer — avoids a far-future fixed date; cap one year ahead. */
function priceValidUntilDate(): string {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() + 365);
  return end.toISOString().slice(0, 10);
}

export function ProductJsonLd({
  product,
  brandName = DEFAULT_BRAND_NAME,
  sellerName = DEFAULT_SELLER_NAME,
}: Props) {
  const priceValidUntil = priceValidUntilDate();
  const storefrontProductUrl = `${getSiteUrl()}/products/${product.id}`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    productID: String(product.id),
    url: storefrontProductUrl,
    image: product.images.map((img) => img.src),
    description: product.descriptionPlain || product.shortDescriptionPlain,
    sku: product.sku || undefined,
    brand: {
      "@type": "Brand",
      name: brandName,
    },
    offers: {
      "@type": "Offer",
      url: storefrontProductUrl,
      priceCurrency: "EGP",
      price: product.price,
      priceValidUntil,
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: sellerName,
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
