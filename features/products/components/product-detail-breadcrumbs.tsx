import { Link } from "next-view-transitions";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Product } from "@/features/products/types";

export function ProductDetailBreadcrumbs({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const chain = product.categories;
  const leaf = product.name;

  return (
    <nav aria-label="مسار التصفح" className={cn("text-sm text-muted-foreground", className)}>
      <ol className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5">
        <li className="shrink-0">
          <Link href={ROUTES.HOME} className="font-medium text-foreground/80 hover:text-foreground">
            الرئيسية
          </Link>
        </li>
        {chain.map((cat) => (
          <li key={cat.id} className="flex min-w-0 items-center gap-1">
            <Chevron className="shrink-0 opacity-50" />
            <Link
              href={ROUTES.CATEGORY(cat.slug)}
              className="min-w-0 truncate hover:text-foreground"
            >
              {cat.name}
            </Link>
          </li>
        ))}
        <li className="flex min-w-0 items-center gap-1">
          <Chevron className="shrink-0 opacity-50" />
          <span className="min-w-0 truncate font-medium text-foreground" aria-current="page">
            {leaf}
          </span>
        </li>
      </ol>
    </nav>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      className={cn("rotate-180 text-muted-foreground", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
