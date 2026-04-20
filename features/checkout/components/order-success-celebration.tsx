"use client";

import { useTransitionRouter } from "next-view-transitions";
import { Button } from "@/components/Button";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const HEART_COUNT = 18;

function HeartParticle({ index }: { index: number }) {
  const left = ((index * 37) % 100) + (index % 3) * 2;
  const duration = 2.8 + (index % 5) * 0.35;
  const delay = (index * 0.12) % 2.5;

  return (
    <span
      className="cart-success-heart pointer-events-none absolute bottom-0 text-2xl will-change-transform select-none sm:text-3xl"
      style={{
        left: `${left}%`,
        animation: `cart-success-heart-float ${duration}s ease-in-out ${delay}s infinite`,
      }}
      aria-hidden
    >
      ❤️
    </span>
  );
}

type OrderSuccessCelebrationProps = {
  open: boolean;
  onDismiss: () => void;
};

/**
 * طبقة شكر بعد تأكيد الطلب: نص ترحيبي وقلوب تطفو للأعلى (keyframes في globals.css).
 */
export function OrderSuccessCelebration({ open, onDismiss }: OrderSuccessCelebrationProps) {
  const router = useTransitionRouter();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-success-title"
      aria-describedby="order-success-desc"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: HEART_COUNT }).map((_, i) => (
          <HeartParticle key={i} index={i} />
        ))}
      </div>

      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-2xl border border-white/15 bg-white px-6 py-10 text-center shadow-2xl",
        )}
      >
        <div className="relative">
          <p className="font-display text-3xl font-bold text-brand-950 sm:text-4xl" id="order-success-title">
            شكراً لك 💚
          </p>
          <p className="mt-3 text-base font-medium text-foreground/90" id="order-success-desc">
            تم استلام طلبك بنجاح. نقدّر ثقتك في سوكاني ونتمنى لك تجربة رائعة.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">فريق خدمة العملاء جاهز لمساعدتك في أي وقت.</p>

          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="min-h-12 font-bold"
              onClick={() => {
                onDismiss();
                router.push(ROUTES.HOME);
              }}
            >
              متابعة التسوق
            </Button>
            <Button type="button" variant="ghost" size="lg" onClick={onDismiss}>
              إغلاق
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

