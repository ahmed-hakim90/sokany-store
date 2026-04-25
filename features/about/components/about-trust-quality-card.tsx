import { cn } from "@/lib/utils";

export type TrustTile = { title: string; description: string };

export type AboutTrustQualityCardProps = {
  title: string;
  body: string;
  tiles: readonly TrustTile[];
  className?: string;
};

function trustTileGridClass(count: number) {
  if (count === 2) return "grid grid-cols-2 gap-3 sm:gap-4";
  if (count === 3) return "grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4";
  return "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4";
}

export function AboutTrustQualityCard({ title, body, tiles, className }: AboutTrustQualityCardProps) {
  if (tiles.length < 2) return null;

  return (
    <article
      className={cn(
        "rounded-[1.35rem] border border-black/[0.06] bg-white p-8 shadow-[0_2px_20px_-6px_rgba(15,23,42,0.08)] sm:p-9 md:p-10",
        className,
      )}
    >
      <h2 className="font-display text-xl font-bold tracking-tight text-brand-950 sm:text-2xl">{title}</h2>
      <p className="mt-4 max-w-prose text-pretty text-sm leading-[1.85] text-muted-foreground sm:text-[15px]">
        {body}
      </p>
      <div className={cn("mt-8", trustTileGridClass(tiles.length))}>
        {tiles.map((tile) => (
          <div
            key={tile.title}
            className="rounded-2xl border border-border/70 bg-page/90 px-4 py-4 sm:px-5 sm:py-5"
          >
            <p className="font-display text-sm font-bold text-brand-950">{tile.title}</p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">{tile.description}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
