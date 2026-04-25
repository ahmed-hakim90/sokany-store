import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AboutFeature = {
  title: string;
  body: string;
};

export type AboutFeatureBlockProps = {
  items: readonly AboutFeature[];
  className?: string;
};

/*
 * شبكة بطاقات ميزات: عمود واحد على الجوال، عمودان من sm، ثلاثة أعمدة من lg؛ كل بطاقة بنفس الارتفاع المرن داخل الشبكة.
 */
export function AboutFeatureBlock({ items, className }: AboutFeatureBlockProps) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => (
        <Card key={item.title} variant="feature">
          <h3 className="font-display text-lg font-semibold text-brand-950">
            {item.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {item.body}
          </p>
        </Card>
      ))}
    </div>
  );
}
