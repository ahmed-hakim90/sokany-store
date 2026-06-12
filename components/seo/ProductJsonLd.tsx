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

function availabilityUrl(inStock: boolean): string {
  return inStock
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";
}

function buildOffers(
  product: ProductView,
  storefrontProductUrl: string,
  sellerName: string,
) {
  const priceValidUntil = priceValidUntilDate();
  const seller = {
    "@type": "Organization" as const,
    name: sellerName,
  };

  const currentPrice = product.price;
  const regular = product.regularPrice;

  if (product.productType === "variable") {
    const low = currentPrice;
    const high =
      regular && Number(regular) > Number(currentPrice) ? regular : currentPrice;
    return {
      "@type": "AggregateOffer",
      url: storefrontProductUrl,
      priceCurrency: "EGP",
      lowPrice: low,
      highPrice: high,
      offerCount: 1,
      priceValidUntil,
      itemCondition: "https://schema.org/NewCondition",
      availability: availabilityUrl(product.inStock),
      seller,
    };
  }

  const offer: Record<string, unknown> = {
    "@type": "Offer",
    url: storefrontProductUrl,
    priceCurrency: "EGP",
    price: currentPrice,
    priceValidUntil,
    itemCondition: "https://schema.org/NewCondition",
    availability: availabilityUrl(product.inStock),
    seller,
  };

  if (
    product.onSale &&
    product.salePrice &&
    product.regularPrice &&
    Number(product.regularPrice) > Number(product.salePrice)
  ) {
    offer.price = product.salePrice;
  }

  return offer;
}

export function ProductJsonLd({
  product,
  brandName = DEFAULT_BRAND_NAME,
  sellerName = DEFAULT_SELLER_NAME,
}: Props) {
  const storefrontProductUrl = `${getSiteUrl()}/products/${product.id}`;
  const images = product.images.map((img) => img.src).filter(Boolean);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    productID: String(product.id),
    url: storefrontProductUrl,
    ...(images.length > 0 ? { image: images } : {}),
    description: product.descriptionPlain || product.shortDescriptionPlain,
    sku: product.sku || undefined,
    brand: {
      "@type": "Brand",
      name: brandName,
    },
    offers: buildOffers(product, storefrontProductUrl, sellerName),
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
