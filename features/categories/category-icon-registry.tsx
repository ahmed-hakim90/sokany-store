import { cn } from "@/lib/utils";

const stroke = "stroke-current";
const baseIcon = "h-6 w-6 shrink-0";

function IconKitchen({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn(baseIcon, className)} aria-hidden>
      <path
        className={stroke}
        strokeWidth="1.5"
        d="M4 10h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9Z"
        strokeLinejoin="round"
      />
      <path className={stroke} strokeWidth="1.5" d="M7 10V7a5 5 0 0 1 10 0v3" />
      <path className={stroke} strokeWidth="1.5" d="M9 14h6" strokeLinecap="round" />
    </svg>
  );
}

function IconHome({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn(baseIcon, className)} aria-hidden>
      <path
        className={stroke}
        strokeWidth="1.5"
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPersonalCare({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn(baseIcon, className)} aria-hidden>
      <path
        className={stroke}
        strokeWidth="1.5"
        d="M12 3v18M8 7c0-2 1.5-3 4-3s4 1 4 3v3H8V7Z"
        strokeLinejoin="round"
      />
      <path className={stroke} strokeWidth="1.5" d="M8 13h8v8H8z" strokeLinejoin="round" />
    </svg>
  );
}

function IconIron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn(baseIcon, className)} aria-hidden>
      <path
        className={stroke}
        strokeWidth="1.5"
        d="M5 10h14l-1 8H6L5 10Z"
        strokeLinejoin="round"
      />
      <path className={stroke} strokeWidth="1.5" d="M8 6h8v4H8z" strokeLinejoin="round" />
      <path className={stroke} strokeWidth="1.5" d="M10 18v3M14 18v3" strokeLinecap="round" />
    </svg>
  );
}

function IconCoffee({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn(baseIcon, className)} aria-hidden>
      <path
        className={stroke}
        strokeWidth="1.5"
        d="M5 18V8h10v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z"
        strokeLinejoin="round"
      />
      <path className={stroke} strokeWidth="1.5" d="M15 10h2a2 2 0 0 1 0 4h-2" />
      <path className={stroke} strokeWidth="1.5" d="M8 4v2M12 4v2" strokeLinecap="round" />
    </svg>
  );
}

function IconSpareParts({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn(baseIcon, className)} aria-hidden>
      <path
        className={stroke}
        strokeWidth="1.5"
        d="M10.5 4.5 6 9l4.5 4.5L15 9l-4.5-4.5Z"
        strokeLinejoin="round"
      />
      <path
        className={stroke}
        strokeWidth="1.5"
        d="m14 14 5.5 5.5M14 19.5 19.5 14"
        strokeLinecap="round"
      />
      <circle className={stroke} strokeWidth="1.5" cx="7" cy="17" r="2" />
    </svg>
  );
}

function IconGridFallback({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn(baseIcon, className)} aria-hidden>
      <path className={stroke} strokeWidth="1.5" d="M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z" />
    </svg>
  );
}

const registry: Record<string, React.ComponentType<{ className?: string }>> = {
  "kitchen-supplies": IconKitchen,
  "home-appliances": IconHome,
  "personal-care": IconPersonalCare,
  "cloth-iron": IconIron,
  "coffee-maker": IconCoffee,
  "spare-parts": IconSpareParts,
};

export { CATEGORY_ICON_SLUGS, type CategoryIconSlug } from "@/lib/category-icon-slugs";

export type CategoryIconProps = {
  slug: string;
  className?: string;
};

export function CategoryIcon({ slug, className }: CategoryIconProps) {
  const Cmp = registry[slug] ?? IconGridFallback;
  return <Cmp className={className} />;
}
