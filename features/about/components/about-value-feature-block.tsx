import { cn } from "@/lib/utils";

export type ValueTile = { title: string; description: string };

export type AboutValueFeatureBlockProps = {
  title: string;
  body: string;
  tiles: readonly ValueTile[];
  className?: string;
};

export function AboutValueFeatureBlock({ title, body, tiles, className }: AboutValueFeatureBlockProps) {
  const [a, b] = tiles;
  if (!a || !b || tiles.length < 2) return null;

  return (
    <section className={cn("space-y-8", className)}>
      <div className="max-w-prose">
        <h2 className="font-display text-xl font-bold tracking-tight text-brand-950 sm:text-2xl">{title}</h2>
        <p className="mt-4 text-pretty text-sm leading-[1.85] text-muted-foreground sm:text-[15px]">{body}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {[a, b].map((tile) => (
          <div
            key={tile.title}
            className="rounded-2xl border border-black/[0.06] bg-white px-4 py-5 shadow-[0_2px_16px_-6px_rgba(15,23,42,0.06)] sm:px-5 sm:py-6"
          >
            <p className="font-display text-[13px] font-bold text-brand-950 sm:text-sm">{tile.title}</p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">{tile.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
