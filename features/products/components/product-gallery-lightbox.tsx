"use client";

import { FocusTrap } from "focus-trap-react";
import { useLayoutEffect, useRef } from "react";
import {
  TransformComponent,
  TransformWrapper,
  useControls,
} from "react-zoom-pan-pinch";
import { toAbsoluteSiteUrl } from "@/lib/site";

type ProductGalleryLightboxProps = {
  open: boolean;
  onClose: () => void;
  activeSrc: string;
  productName: string;
  titleId: string;
};

export function ProductGalleryLightbox({
  open,
  onClose,
  activeSrc,
  productName,
  titleId,
}: ProductGalleryLightboxProps) {
  if (!open || typeof document === "undefined") return null;

  const lightboxImageSrc = toAbsoluteSiteUrl(activeSrc);

  /**
   * نفس الضغطة تفتح من صورة المنتج: بعد الرسم يكون «إغلاق» الخلفية فوق مكان المؤشر
   * فيلتقط mouseup/click فيُغلق فوراً. ref يتفعّل بعد 250ms حتى تُتاح إغلاق الخلفية.
   */
  const backdropCloseArmedRef = useRef(false);
  useLayoutEffect(() => {
    backdropCloseArmedRef.current = false;
    const id = window.setTimeout(() => {
      backdropCloseArmedRef.current = true;
    }, 250);
    return () => window.clearTimeout(id);
  }, [activeSrc]);

  return (
    <FocusTrap
      active
      focusTrapOptions={{
        escapeDeactivates: true,
        // يمنع إغلاق من ضغطة الفتح نفسها أثناء أول 250ms
        clickOutsideDeactivates: () => backdropCloseArmedRef.current,
        onDeactivate: onClose,
        /** يسمح بتمرير العجلة/اللمس داخل منطقة الزوم دون احتجاز من الـ trap */
        preventScroll: false,
      }}
    >
      <div
        className="fixed inset-0 z-[100] flex flex-col bg-black/92 backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className="absolute inset-0 z-0 cursor-default"
          aria-label="إغلاق معاينة الصورة"
          onClick={() => {
            if (backdropCloseArmedRef.current) onClose();
          }}
        />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col pointer-events-none">
          <div className="flex items-center justify-between gap-2 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 pointer-events-auto sm:px-4">
            <p
              id={titleId}
              className="min-w-0 flex-1 truncate text-sm font-semibold text-white"
            >
              {productName}
            </p>
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              onClick={onClose}
              aria-label="إغلاق"
            >
              <CloseIcon />
            </button>
          </div>

          {/* ارتفاع صريح: بدونها قد يبقى wrapper المكتبة بارتفاع 0 فلا يعمل الزوم/القرص */}
          <div className="flex min-h-0 flex-1 items-stretch justify-center px-3 pb-2 sm:px-4">
            <div className="pointer-events-auto flex h-[min(78dvh,760px)] w-full max-w-5xl min-h-[min(78dvh,760px)] flex-col">
              <TransformWrapper
                key={activeSrc}
                initialScale={1}
                minScale={1}
                maxScale={6}
                smooth={false}
                centerOnInit
                centerZoomedOut
                limitToBounds={false}
                wheel={{ step: 0.18, wheelDisabled: false, touchPadDisabled: false }}
                pinch={{ step: 8, disabled: false }}
                doubleClick={{ mode: "toggle", step: 0.85, disabled: false }}
                panning={{
                  disabled: false,
                  allowLeftClickPan: true,
                  velocityDisabled: false,
                }}
              >
                <div className="relative h-full min-h-0 w-full flex-1">
                  {/* TransformComponent أولاً حتى يُهيأ الـ wrapper قبل أزرار الزوم */}
                  <TransformComponent
                    wrapperClass="!absolute !inset-0 !h-full !w-full"
                    contentClass="!flex !h-full !w-full !items-center !justify-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- zoom/pan يحتاج img عادي */}
                    <img
                      src={lightboxImageSrc}
                      alt={productName}
                      className="max-h-full max-w-full object-contain select-none"
                      draggable={false}
                    />
                  </TransformComponent>

                  <div className="pointer-events-auto absolute inset-x-0 top-2 z-20 flex flex-wrap items-center justify-center gap-2 px-1">
                    <LightboxZoomChrome
                      imageSrc={lightboxImageSrc}
                      downloadLabel={productName}
                    />
                  </div>
                </div>
              </TransformWrapper>
            </div>
          </div>

          <p className="pointer-events-auto pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-xs text-white/75">
            أزرار +/− أو قرص الفأرة · إصبعين للتكبير على الموبايل · ضعف النقر للتبديل
          </p>
        </div>
      </div>
    </FocusTrap>
  );
}

function LightboxZoomChrome({
  imageSrc,
  downloadLabel,
}: {
  imageSrc: string;
  downloadLabel: string;
}) {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <>
      <div className="flex items-center gap-1 rounded-full bg-black/55 p-1 ring-1 ring-white/20 backdrop-blur-sm">
        <IconButton label="تصغير" onClick={() => zoomOut(0.55, 250)}>
          <MinusIcon />
        </IconButton>
        <IconButton label="إعادة الحجم" onClick={() => resetTransform(250)}>
          <ResetIcon />
        </IconButton>
        <IconButton label="تكبير" onClick={() => zoomIn(0.55, 250)}>
          <PlusIcon />
        </IconButton>
      </div>
      <button
        type="button"
        onClick={() => void downloadProductImage(imageSrc, downloadLabel)}
        className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm transition-colors hover:bg-black/70"
      >
        <DownloadIcon className="h-4 w-4" />
        تحميل الصورة
      </button>
    </>
  );
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15"
    >
      {children}
    </button>
  );
}

async function downloadProductImage(url: string, baseName: string) {
  const safe = baseName.replace(/[^\w\u0600-\u06FF\- ]/gu, "_").trim().slice(0, 80) || "product-image";
  const extMatch = url.match(/\.(jpe?g|png|webp|gif|avif)(\?|$)/i);
  const ext = extMatch?.[1]?.toLowerCase().replace("jpeg", "jpg") ?? "jpg";
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `${safe}.${ext}`;
    a.rel = "noopener";
    a.click();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M4 12a8 8 0 1116 0 8 8 0 01-16 0z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9 12h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
