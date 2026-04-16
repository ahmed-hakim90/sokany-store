import { Container } from "@/components/Container";
import { ProductSkeleton } from "@/features/products/components/ProductSkeleton";

export default function Loading() {
  return (
    <Container className="py-10">
      <div className="mb-8 min-w-0">
        <div className="h-8 w-40 animate-shimmer rounded bg-brand-100" />
        <div className="mt-3 h-4 w-56 animate-shimmer rounded bg-border/70" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    </Container>
  );
}
