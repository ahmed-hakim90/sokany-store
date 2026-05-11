"use client";

import type { ModelViewerElement } from "@google/model-viewer";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type Product3DViewerProps = {
  modelSrc: string;
  productName: string;
  posterSrc?: string | null;
};

type ModelViewerProgressEvent = CustomEvent<{ totalProgress: number }>;

export function Product3DViewer({
  modelSrc,
  productName,
  posterSrc,
}: Product3DViewerProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [slowNetwork, setSlowNetwork] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void import("@google/model-viewer")
      .then(() => {
        if (!cancelled) setViewerReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError("تعذر تشغيل عارض المنتج ثلاثي الأبعاد على هذا المتصفح.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!viewerReady) return;
    const timeout = window.setTimeout(() => setSlowNetwork(true), 4500);
    return () => window.clearTimeout(timeout);
  }, [viewerReady]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !viewerReady) return;

    const onLoad = () => {
      setModelLoaded(true);
      setLoadError(null);
      setProgress(100);
      setSlowNetwork(false);
    };
    const onError = () => {
      setLoadError("تعذر تحميل نموذج 3D لهذا المنتج. جرّب مرة أخرى لاحقاً.");
      setSlowNetwork(false);
    };
    const onProgress = (event: Event) => {
      const next = Math.round(
        ((event as ModelViewerProgressEvent).detail?.totalProgress ?? 0) * 100,
      );
      setProgress(Math.max(0, Math.min(100, next)));
    };

    viewer.addEventListener("load", onLoad);
    viewer.addEventListener("error", onError);
    viewer.addEventListener("progress", onProgress);

    return () => {
      viewer.removeEventListener("load", onLoad);
      viewer.removeEventListener("error", onError);
      viewer.removeEventListener("progress", onProgress);
    };
  }, [viewerReady]);

  const resetCamera = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.resetTurntableRotation();
    viewer.cameraOrbit = "0deg 75deg 105%";
    viewer.fieldOfView = "30deg";
    viewer.jumpCameraToGoal();
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const shell = shellRef.current;
    if (!shell) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
      return;
    }

    if (shell.requestFullscreen) {
      await shell.requestFullscreen().catch(() => setExpanded(true));
      return;
    }

    setExpanded(true);
  }, []);

  if (!modelSrc) {
    return (
      <ViewerFallback
        title="لا يوجد نموذج ثلاثي الأبعاد"
        body="هذا المنتج لا يحتوي حالياً على ملف 3D مرتبط بالـ SKU."
      />
    );
  }

  return (
    <div
      ref={shellRef}
      className={cn(
        "relative flex h-full min-h-[min(68svh,680px)] flex-col overflow-hidden rounded-[1.75rem] border border-white/12 bg-slate-950 shadow-[0_24px_80px_-42px_rgba(0,0,0,0.9)] ring-1 ring-white/10",
        expanded && "fixed inset-0 z-[2700] rounded-none",
      )}
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.12),transparent_30%)]" />

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-white/[0.04] p-3 backdrop-blur">
        <div className="min-w-0">
          <p className="text-xs font-bold text-white/70">اسحب للتدوير، وقرّب بإصبعين</p>
          <p className="mt-0.5 text-[11px] font-semibold text-brand-200/90">
            AR يظهر على الأجهزة والمتصفحات الداعمة فقط
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <ViewerControl
            label={autoRotate ? "إيقاف الدوران التلقائي" : "تشغيل الدوران التلقائي"}
            onClick={() => setAutoRotate((value) => !value)}
          >
            {autoRotate ? <PauseIcon /> : <PlayIcon />}
          </ViewerControl>
          <ViewerControl label="إعادة ضبط الكاميرا" onClick={resetCamera}>
            <ResetIcon />
          </ViewerControl>
          <ViewerControl label="ملء الشاشة" onClick={() => void toggleFullscreen()}>
            <FullscreenIcon />
          </ViewerControl>
          {expanded ? (
            <ViewerControl label="الخروج من ملء الشاشة" onClick={() => setExpanded(false)}>
              <CloseIcon />
            </ViewerControl>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 min-h-0 flex-1">
        {!viewerReady ? (
          <ViewerLoading progress={progress} label="جاري تجهيز عارض 3D…" />
        ) : null}

        {viewerReady ? (
          <model-viewer
            ref={viewerRef}
            src={modelSrc}
            poster={posterSrc ?? undefined}
            alt={`نموذج ثلاثي الأبعاد لمنتج ${productName}`}
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            auto-rotate={autoRotate}
            auto-rotate-delay={2500}
            shadow-intensity={0.85}
            environment-image="neutral"
            exposure={1}
            interaction-prompt="auto"
            loading="lazy"
            reveal="auto"
            touch-action="pan-y"
            className="h-full min-h-[min(58svh,620px)] w-full bg-transparent [--poster-color:transparent] [&::part(default-ar-button)]:hidden"
          >
            <button
              slot="ar-button"
              type="button"
              className="absolute bottom-4 end-4 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-slate-950 shadow-xl ring-1 ring-white/60 transition-transform hover:scale-[1.02]"
            >
              <ARIcon />
              عرض AR
            </button>
          </model-viewer>
        ) : null}

        {viewerReady && !modelLoaded && !loadError ? (
          <ViewerLoading progress={progress} label="جاري تحميل النموذج…" />
        ) : null}

        {loadError ? (
          <div className="absolute inset-0 z-20 grid place-items-center bg-slate-950/88 p-6 text-center backdrop-blur">
            <ViewerFallback title="تعذر عرض النموذج" body={loadError} />
          </div>
        ) : null}
      </div>

      <div className="relative z-10 border-t border-white/10 bg-black/20 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 text-center text-xs font-medium text-white/65">
        {slowNetwork && !modelLoaded && !loadError
          ? "الاتصال بطيء قليلاً، سنُبقي المعاينة بمجرد اكتمال التحميل."
          : "يمكنك تدوير المنتج، التكبير، أو فتح AR من الجهاز الداعم."}
      </div>
    </div>
  );
}

function ViewerLoading({ progress, label }: { progress: number; label: string }) {
  return (
    <div
      className="absolute inset-0 z-10 grid place-items-center bg-slate-950/70 p-6 backdrop-blur-sm"
      aria-live="polite"
      aria-busy
    >
      <div className="w-full max-w-xs rounded-3xl border border-white/10 bg-white/[0.08] p-5 text-center shadow-2xl">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-white/25 border-t-brand-300" />
        <p className="mt-4 text-sm font-bold text-white">{label}</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-brand-300 transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs font-semibold text-white/60">{progress}%</p>
      </div>
    </div>
  );
}

function ViewerFallback({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-sm rounded-3xl border border-white/10 bg-white/[0.08] p-6 text-center text-white shadow-2xl">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-brand-200">
        <BoxIcon />
      </div>
      <h3 className="mt-4 font-display text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/70">{body}</p>
    </div>
  );
}

function ViewerControl({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/10 transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300"
    >
      {children}
    </button>
  );
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M4 12a8 8 0 118 8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
      <path
        d="M4 16v-4h4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M9 6v12M15 6v12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M8 5.8c0-.8.9-1.3 1.6-.9l8.1 5.2a1.1 1.1 0 010 1.8l-8.1 5.2c-.7.4-1.6-.1-1.6-.9V5.8z" />
    </svg>
  );
}

function ARIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M12 3l7 4v10l-7 4-7-4V7l7-4z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="M12 11l7-4M12 11L5 7M12 11v10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <path
        d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="M4 7.5l8 4.5 8-4.5M12 12v9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
