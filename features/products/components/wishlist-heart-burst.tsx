"use client";

/*
 * تأثير «انفجار قلوب» عند الضغط على المفضلة — مسار التنفيذ (للمراجعة):
 * 1) الزر يحسب مركزه على الشاشة (viewport) عبر getBoundingClientRect في ProductCard.
 * 2) ننشئ N كائن HeartParticle (موضع البداية + تأخير + انزياح عشوائي).
 * 3) WishlistHeartBurstPortal يعرض كل جزيء داخل document.body بـ createPortal
 *    حتى لا يقصّه overflow:hidden على كارت المنتج.
 * 4) كل جزيء ‎div‎ مع ‎@keyframes wishlist-burst-particle‎ (انظر ‎globals.css‎)؛ ‎animationend‎ يحذفه من القائمة.
 */

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

// حجم أيقونة القلب بالبكسل (h-3.5 w-3.5 = 14px) — نستخدمه لمحاذاة مركز الانطلاق بدقة.
const ICON_PX = 14;
// نصف القطر: نطرحه من مركز الزر حتى يكون أصل الإحداثيات عند منتصف الأيقونة وليس زاوية الصندوق.
const HALF = ICON_PX / 2;

/** عدد القلوب في كل ضغطة — يمكن تغييره من الخارج للاختبار أو ضبط الكثافة. */
export const WISHLIST_HEART_BURST_COUNT = 10;
/** الفترة بين بداية كل قلب والذي يليه (بالثواني) — كلما زادت، ظهرت «ورا بعض» ببطء أكثر. */
export const WISHLIST_HEART_BURST_STAGGER_SEC = 0.072;

/** شكل بيانات «جزيء» واحد: معرف فريد + نقطة البداية على الشاشة + انزياح أفقي + تأخير الأنيميشن. */
export type HeartParticle = {
  id: number;
  originX: number;
  originY: number;
  driftX: number;
  delay: number;
};

/** SVG قلب صغير معبّى — نفس الشكل تقريباً لزر المفضلة؛ decorative فقط (aria-hidden). */
function BurstHeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
      <path
        fill="currentColor"
        d="M12 21s-7-4.35-9.33-8.15A5.65 5.65 0 0112 5a5.65 5.65 0 019.33 7.85C19 16.65 12 21 12 21z"
      />
    </svg>
  );
}

/** قلب واحد طائر: يُرسم مرة واحدة ثم يُزال من الحالة عند ‎animationend‎. */
function BurstParticle({
  particle: p,
  onComplete,
}: {
  particle: HeartParticle;
  onComplete: () => void;
}) {
  return (
    <div
      className="pointer-events-none fixed z-[10050] h-3.5 w-3.5 text-brand-950 motion-reduce:hidden"
      style={{
        left: p.originX - HALF,
        top: p.originY - HALF,
        ["--burst-drift-x" as string]: `${p.driftX}px`,
        animation: `wishlist-burst-particle 0.82s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s both`,
      }}
      onAnimationEnd={(e) => {
        if (e.animationName === "wishlist-burst-particle") {
          onComplete();
        }
      }}
    >
      <BurstHeartIcon />
    </div>
  );
}

/** يعرض كل الجزيئات داخل body؛ لا يعمل على الخادم قبل hydration لأن document.body غير متاح في SSR. */
export function WishlistHeartBurstPortal({
  particles,
  onRemove,
}: {
  particles: HeartParticle[];
  onRemove: (id: number) => void;
}) {
  // false على الخادم وعند أول رسم عميل = لا نستدعي createPortal قبل وجود document.body.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // document.body is unavailable during SSR; defer portal until after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional mount gate for createPortal
    setMounted(true);
  }, []);

  // لا بورتال قبل التركيب، ولا داعي لرسم شيء إذا القائمة فارغة.
  if (!mounted || particles.length === 0) return null;

  // createPortal(محتوى React, عقدة DOM حقيقية) — المحتوى يظهر كابن لـ body لكن state يبقى من نفس الشجرة.
  return createPortal(
    <>
      {particles.map((p) => (
        <BurstParticle
          key={p.id}
          particle={p}
          onComplete={() => onRemove(p.id)}
        />
      ))}
    </>,
    document.body,
  );
}
