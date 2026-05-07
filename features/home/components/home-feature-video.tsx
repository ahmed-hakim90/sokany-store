"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import type { CmsHomeFeatureVideo } from "@/schemas/cms";
import { cn } from "@/lib/utils";

/* ─────────────────────────────  URL parsing  ───────────────────────────── */

type EmbedInfo =
  | { kind: "youtube"; videoId: string }
  | { kind: "vimeo"; videoId: string };

/**
 * يكتشف روابط يوتيوب/فيميو ويرجّع الـ videoId. لو الرابط ملف فيديو مباشر
 * (mp4/webm) أو شكل غير معروف، يرجّع null ونستخدم وسم <video> العادي.
 */
function parseEmbed(rawUrl: string): EmbedInfo | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase().replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
    return id ? { kind: "youtube", videoId: id } : null;
  }
  if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "youtube-nocookie.com"
  ) {
    let id = url.searchParams.get("v") ?? "";
    if (!id) {
      const segments = url.pathname.split("/").filter(Boolean);
      const known = new Set(["embed", "shorts", "v", "live"]);
      const idx = segments.findIndex((s) => known.has(s));
      if (idx >= 0 && segments[idx + 1]) id = segments[idx + 1];
    }
    return id ? { kind: "youtube", videoId: id } : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const segments = url.pathname.split("/").filter(Boolean);
    const id = segments[segments.length - 1] ?? "";
    return /^\d+$/.test(id) ? { kind: "vimeo", videoId: id } : null;
  }
  return null;
}

/* ───────────────────────  YouTube IFrame Player API  ───────────────────── */

interface YouTubePlayer {
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  setVolume: (volume: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
}

/** نسبة الصوت الافتراضية لما الفيديو يقدر يشتغل بصوت (1–100 ليوتيوب، 0–1 لـ video/Vimeo). */
const DEFAULT_VOLUME_PERCENT = 30;

interface YouTubeApi {
  Player: new (
    element: HTMLElement | string,
    options: {
      videoId: string;
      width?: string | number;
      height?: string | number;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (e: { target: YouTubePlayer }) => void;
        onStateChange?: (e: { data: number; target: YouTubePlayer }) => void;
      };
    },
  ) => YouTubePlayer;
}

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiPromise: Promise<YouTubeApi> | null = null;
function loadYouTubeApi(): Promise<YouTubeApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube IFrame API requires a browser"));
  }
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise<YouTubeApi>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      if (window.YT?.Player) resolve(window.YT);
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}

/* ───────────────────────────  YouTube embed  ───────────────────────────── */

function YouTubeEmbed({ videoId }: { videoId: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  /*
   * نبدأ مكتوم عشان autoplay يشتغل. بعد ما الفيديو يبدأ بنحاول نفك الكتم
   * ونضبط الصوت على 30٪. لو المتصفّح منع (موبايل/سفاري عادةً) بنرجّع state
   * إلى muted=true لحد ما المستخدم يضغط زرار الصوت بنفسه.
   */
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    /*
     * نضيف placeholder بنفسنا (مش عبر React) لأن YT.Player بيستبدله بـ iframe،
     * وده يربك Reconciler لو React هو اللي عامله render. التنظيف في cleanup.
     */
    const placeholder = document.createElement("div");
    placeholder.style.cssText = "width:100%;height:100%;";
    wrapper.appendChild(placeholder);

    let player: YouTubePlayer | null = null;
    let cancelled = false;
    let unmuteTimer: number | undefined;
    void loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !wrapper.contains(placeholder)) return;
        player = new YT.Player(placeholder, {
          videoId,
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 1,
            mute: 1,
            loop: 1,
            playlist: videoId,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            iv_load_policy: 3,
            disablekb: 1,
            fs: 0,
            playsinline: 1,
          },
          events: {
            onReady: (e) => {
              e.target.setVolume(DEFAULT_VOLUME_PERCENT);
              e.target.playVideo();
              setReady(true);
              /*
               * نحاول فك الكتم بعد ما الفيديو يبتدي play. لو المتصفح صدّق
               * (Chrome desktop غالباً يصدّق) هنشتغل بصوت. لو رفض (موبايل/سفاري)
               * بنرجّع UI لـ muted=true لحد ما المستخدم يضغط بنفسه.
               */
              window.setTimeout(() => {
                if (!playerRef.current) return;
                playerRef.current.setVolume(DEFAULT_VOLUME_PERCENT);
                playerRef.current.unMute();
                setMuted(false);
                unmuteTimer = window.setTimeout(() => {
                  if (playerRef.current?.isMuted()) setMuted(true);
                }, 500);
              }, 200);
            },
            onStateChange: (e) => {
              if (e.data === 1) setPlaying(true);
              else if (e.data === 2 || e.data === 0) setPlaying(false);
            },
          },
        });
        playerRef.current = player;
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      if (unmuteTimer) window.clearTimeout(unmuteTimer);
      try {
        player?.destroy();
      } catch {
        /* destroy may throw if iframe was already removed */
      }
      playerRef.current = null;
      if (wrapper.contains(placeholder)) {
        wrapper.removeChild(placeholder);
      }
    };
  }, [videoId]);

  return (
    <>
      <div ref={wrapperRef} className="absolute inset-0" />
      <ClickShield />
      <CustomControls
        playing={playing}
        muted={muted}
        disabled={!ready}
        onTogglePlay={() => {
          const p = playerRef.current;
          if (!p) return;
          if (playing) {
            p.pauseVideo();
            setPlaying(false);
          } else {
            p.playVideo();
            setPlaying(true);
          }
        }}
        onToggleMute={() => {
          const p = playerRef.current;
          if (!p) return;
          const next = !muted;
          if (next) p.mute();
          else p.unMute();
          setMuted(next);
        }}
      />
    </>
  );
}

/* ────────────────────  Vimeo embed (postMessage API)  ──────────────────── */

function VimeoEmbed({ videoId }: { videoId: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);

  const send = (method: string, value?: unknown) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    const payload = value === undefined ? { method } : { method, value };
    win.postMessage(JSON.stringify(payload), "*");
  };

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (typeof e.data !== "string") return;
      let parsed: unknown;
      try {
        parsed = JSON.parse(e.data);
      } catch {
        return;
      }
      if (typeof parsed !== "object" || parsed === null) return;
      const data = parsed as { event?: string };
      if (data.event === "play") setPlaying(true);
      else if (data.event === "pause") setPlaying(false);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const src = useMemo(() => {
    const params = new URLSearchParams({
      autoplay: "1",
      muted: "1",
      loop: "1",
      controls: "0",
      title: "0",
      byline: "0",
      portrait: "0",
      transparent: "0",
      dnt: "1",
    });
    return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
  }, [videoId]);

  return (
    <>
      <iframe
        ref={iframeRef}
        className="absolute inset-0 h-full w-full"
        src={src}
        title="فيديو مميز"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={() => {
          send("addEventListener", "play");
          send("addEventListener", "pause");
        }}
      />
      <ClickShield />
      <CustomControls
        playing={playing}
        muted={muted}
        onTogglePlay={() => {
          if (playing) send("pause");
          else send("play");
        }}
        onToggleMute={() => {
          const next = !muted;
          send("setMuted", next);
          setMuted(next);
        }}
      />
    </>
  );
}

/* ─────────────────────────  Direct video file  ─────────────────────────── */

function DirectVideoEmbed({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [loadError, setLoadError] = useState(false);

  return (
    <>
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        src={src}
        poster={poster || undefined}
        autoPlay
        loop
        muted={muted}
        playsInline
        preload="metadata"
        onLoadedData={() => {
          setLoadError(false);
          void videoRef.current
            ?.play()
            .then(() => setPlaying(true))
            .catch(() => setPlaying(false));
        }}
        onError={() => {
          setLoadError(true);
          setPlaying(false);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {loadError ? (
        <div className="absolute inset-x-4 top-4 z-20 rounded-xl border border-white/15 bg-black/62 px-3 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-md">
          تعذر تشغيل الفيديو. تأكد أن الرابط ملف فيديو مباشر بصيغة MP4 أو WebM، أو استخدم رابط يوتيوب/فيميو.
        </div>
      ) : null}
      <CustomControls
        playing={playing}
        muted={muted}
        onTogglePlay={() => {
          const el = videoRef.current;
          if (!el) return;
          if (el.paused) {
            void el
              .play()
              .then(() => setPlaying(true))
              .catch(() => setPlaying(false));
          } else {
            el.pause();
            setPlaying(false);
          }
        }}
        onToggleMute={() => {
          const next = !muted;
          setMuted(next);
          if (videoRef.current) {
            videoRef.current.muted = next;
            if (!next) void videoRef.current.play().catch(() => undefined);
          }
        }}
      />
    </>
  );
}

/* ──────────────────────────  Shared UI bits  ───────────────────────────── */

/** يمتص النقرات على البلاير عشان المستخدم ميخبطش على iframe ويوقف الفيديو/يطلّع العنوان. */
function ClickShield() {
  return (
    <button
      type="button"
      aria-hidden
      tabIndex={-1}
      className="absolute inset-0 z-[5] cursor-default bg-transparent"
    />
  );
}

function CustomControls({
  playing,
  muted,
  disabled = false,
  onTogglePlay,
  onToggleMute,
}: {
  playing: boolean;
  muted: boolean;
  disabled?: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
}) {
  return (
    <div className="absolute bottom-3 end-3 z-20 flex items-center gap-2">
      <button
        type="button"
        disabled={disabled}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/58 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-60"
        aria-label={playing ? "إيقاف الفيديو" : "تشغيل الفيديو"}
        aria-pressed={playing}
        onClick={onTogglePlay}
      >
        {playing ? (
          <Pause className="h-5 w-5" aria-hidden />
        ) : (
          <Play className="h-5 w-5 translate-x-0.5" aria-hidden />
        )}
      </button>
      <button
        type="button"
        disabled={disabled}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/58 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-60"
        aria-label={muted ? "تشغيل صوت الفيديو" : "كتم صوت الفيديو"}
        aria-pressed={!muted}
        onClick={onToggleMute}
      >
        {muted ? (
          <VolumeX className="h-5 w-5" aria-hidden />
        ) : (
          <Volume2 className="h-5 w-5" aria-hidden />
        )}
      </button>
    </div>
  );
}

/* ──────────────────────────────  Main  ─────────────────────────────────── */

export function HomeFeatureVideo({
  video,
  className,
}: {
  video: CmsHomeFeatureVideo;
  className?: string;
}) {
  const src = video.videoUrl.trim();
  const poster = video.posterImageUrl.trim();
  const embed = useMemo(() => parseEmbed(src), [src]);

  if (!video.enabled || !src) return null;

  return (
    <section
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl bg-black shadow-[0_16px_42px_-30px_rgba(15,23,42,0.65)]",
        className,
      )}
      aria-label="فيديو مميز"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-black sm:aspect-[21/9]">
        {embed?.kind === "youtube" ? (
          <YouTubeEmbed videoId={embed.videoId} />
        ) : embed?.kind === "vimeo" ? (
          <VimeoEmbed videoId={embed.videoId} />
        ) : (
          <DirectVideoEmbed src={src} poster={poster} />
        )}
        {/* تدرّج خفيف فوق البلاير لتحسين تباين الزراير. لا يعترض النقرات. */}
        <div className="pointer-events-none absolute inset-0 z-[10] bg-gradient-to-t from-black/28 via-transparent to-black/10" />
      </div>
    </section>
  );
}
