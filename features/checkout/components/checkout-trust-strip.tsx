import { Headphones, LockKeyhole, RotateCcw, ShieldCheck } from "lucide-react";

const trustItems = [
  { title: "دفع آمن", icon: LockKeyhole },
  { title: "ضمان الجودة", icon: ShieldCheck },
  { title: "استرجاع 14 يوم", icon: RotateCcw },
  { title: "دعم 24/7", icon: Headphones },
] as const;

export function CheckoutTrustStrip() {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border/70 bg-white/85 p-2 shadow-[0_6px_22px_-16px_rgba(15,23,42,0.18)] sm:grid-cols-4">
      {trustItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            className="flex items-center gap-2 rounded-xl bg-page/60 px-3 py-2 text-xs font-semibold text-brand-950"
          >
            <Icon className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
            <span>{item.title}</span>
          </div>
        );
      })}
    </div>
  );
}
