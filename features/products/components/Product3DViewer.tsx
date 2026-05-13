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

  const controlItems = [
    {
      label: "Auto Rotate",
      value: autoRotate ? "On" : "Off",
      onClick: () => setAutoRotate((value) => !value),
      icon: autoRotate ? <PauseIcon /> : <PlayIcon />,
      primary: true,
    },
    {
      label: "AR View",
      value: "View in your space",
      onClick: () => {
        const viewer = viewerRef.current as (ModelViewerElement & { activateAR?: () => void }) | null;
        viewer?.activateAR?.();
      },
      icon: <ARIcon />,
      primary: false,
    },
    {
      label: "Fullscreen",
      value: "Focus mode",
      onClick: () => void toggleFullscreen(),
      icon: <FullscreenIcon />,
      primary: false,
    },
    {
      label: "Reset View",
      value: "Center product",
      onClick: resetCamera,
      icon: <ResetIcon />,
      primary: false,
    },
  ] as const;
  const featureChips = [
    { label: "360° Orbit", icon: <OrbitMiniIcon /> },
    { label: "Pinch to Zoom", icon: <ZoomIcon /> },
    { label: "AR Ready", icon: <ARIcon /> },
    { label: "High Detail", icon: <SparkIcon /> },
  ];

  return (
    <div
      ref={shellRef}
      className={cn(
        "relative flex h-full min-h-[clamp(320px,55dvh,620px)] max-h-[clamp(320px,55dvh,620px)] w-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_18px_70px_-44px_rgba(15,23,42,0.45)] ring-1 ring-slate-100",
        expanded && "fixed inset-0 z-[2700] rounded-none",
      )}
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_18%,rgba(226,232,240,0.8),transparent_34%)]" />

      <div className="relative z-10 grid min-h-0 flex-1 gap-3 p-3 sm:grid-cols-1 sm:gap-3 lg:grid-cols-[minmax(0,1fr)_10rem] lg:p-5">
        <div className="relative min-h-[clamp(320px,55dvh,620px)] max-h-[clamp(320px,55dvh,620px)] overflow-hidden rounded-[1.35rem] bg-[radial-gradient(circle_at_50%_42%,#ffffff,#f1f5f9_72%)] lg:min-h-[560px]">
          {!viewerReady ? (
            <ViewerLoading progress={progress} label="Preparing 3D viewer..." />
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
              shadow-intensity={0.7}
              environment-image="neutral"
              exposure={1.05}
              interaction-prompt="auto"
              loading="lazy"
              reveal="auto"
              touch-action="pan-y"
              className="h-full w-full bg-transparent [--poster-color:transparent] [&::part(default-ar-button)]:hidden"
            >
              <button
                slot="ar-button"
                type="button"
                className="absolute bottom-4 end-4 inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-950 shadow-lg transition-transform hover:scale-[1.02]"
              >
                <ARIcon />
                AR View
              </button>
            </model-viewer>
          ) : null}

          {viewerReady && !modelLoaded && !loadError ? (
            <ViewerLoading progress={progress} label="Loading 3D model..." />
          ) : null}

          {loadError ? (
            <div className="absolute inset-0 z-20 grid place-items-center bg-white/88 p-6 text-center backdrop-blur">
              <ViewerFallback title="Could not load model" body={loadError} />
            </div>
          ) : null}

          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center px-4">
            <div className="rounded-full border border-slate-200 bg-white/88 px-3 py-2 text-center text-xs font-medium text-slate-500 shadow-sm backdrop-blur">
              {slowNetwork && !modelLoaded && !loadError
                ? "Slow connection, preview will appear once loaded."
                : "Drag to rotate • Scroll to zoom • Tap to interact"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-col lg:justify-center">
          {controlItems.map((item) => (
            <ViewerControl
              key={item.label}
              label={item.label}
              value={item.value}
              onClick={item.onClick}
              active={item.primary && autoRotate}
            >
              {item.icon}
            </ViewerControl>
          ))}
          {expanded ? (
            <ViewerControl label="Exit Fullscreen" value="Close focus" onClick={() => setExpanded(false)}>
              <CloseIcon />
            </ViewerControl>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 grid gap-2 border-t border-slate-100 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:grid-cols-4 sm:px-5">
        {featureChips.map((chip) => (
          <div
            key={chip.label}
            className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm"
          >
            <span className="text-slate-500">{chip.icon}</span>
            {chip.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function ViewerLoading({ progress, label }: { progress: number; label: string }) {
  return (
    <div
      className="absolute inset-0 z-10 grid place-items-center bg-white/70 p-6 backdrop-blur-sm"
      aria-live="polite"
      aria-busy
    >
      <div className="w-full max-w-xs rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-2xl">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
        <p className="mt-4 text-sm font-bold text-slate-900">{label}</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-900 transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs font-semibold text-slate-500">{progress}%</p>
      </div>
    </div>
  );
}

function ViewerFallback({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-900 shadow-2xl">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700">
        <BoxIcon />
      </div>
      <h3 className="mt-4 font-display text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

function ViewerControl({
  label,
  value,
  onClick,
  active,
  children,
}: {
  label: string;
  value: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex min-h-16 items-center gap-3 rounded-2xl border bg-white p-3 text-start text-slate-900 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        active ? "border-slate-300" : "border-slate-200",
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
        {children}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-black">{label}</span>
        <span className="mt-0.5 block text-xs font-medium text-slate-500">{value}</span>
      </span>
    </button>
  );
}

function OrbitMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M12 16a4 4 0 100-8 4 4 0 000 8z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M4 12c0-2.2 3.6-4 8-4s8 1.8 8 4-3.6 4-8 4-8-1.8-8-4z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function ZoomIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15zM16 16l5 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
      <path
        d="M10.5 7.5v6M7.5 10.5h6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M12 3l1.6 5.1L19 10l-5.4 1.9L12 17l-1.6-5.1L5 10l5.4-1.9L12 3z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
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
