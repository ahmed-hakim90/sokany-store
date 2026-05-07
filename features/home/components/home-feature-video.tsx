"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { AppImage } from "@/components/AppImage";
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

/** حالات مشغّل يوتيوب (رقمية كما في IFrame API). */
const YT_PS = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

interface YouTubePlayer {
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  setVolume: (volume: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
  getPlayerState: () => number;
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
        onError?: (e: { data: number; target: YouTubePlayer }) => void;
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

function YouTubeEmbed({
  videoId,
  onError,
}: {
  videoId: string;
  onError?: () => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  /*
   * نبدأ مكتوم لضمان autoplay، وبعد أول حدث PLAYING من يوتيوب نجرب نفك الكتم
   * ونضبط الصوت. لو المتصفح يوقف التشغيل أو يرفض الصوت نرجع كتم ونكمل بصمت.
   */
  const [muted, setMuted] = useState(true);
  /* ما نفترضش تشغيل قبل ما نستقبل حدث من يوتيوب — غير كده يبان زر إيقاف وفيديو لسه على شاشة التشغيل. */
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  /* نخزن أحدث callback في ref عشان التغيير ميعملش re-mount للـ player. */
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  /** محاولة فك كتم تلقائية مرة واحدة بعد ما التشغيل يثبت (مش من onReady). */
  const autoUnmuteOnceRef = useRef(false);

  useEffect(() => {
    autoUnmuteOnceRef.current = false;
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
    const retryTimers: number[] = [];
    const scheduleMutedAutoplayRetry = (delayMs: number) => {
      const id = window.setTimeout(() => {
        if (cancelled) return;
        const p = playerRef.current;
        if (!p) return;
        const st = p.getPlayerState();
        /*
         * لو لسه مش شغال (متصفّح أجّل autoplay، أو فك كتم سابق أوقف التشغيل):
         * نفضّل يفضل مكتوم وننادى play تاني — فك الكتم التلقائي بعد الـ ready
         * كثيراً ما يكسر autoplay (السياسة تقتضي تفاعل المستخدم للصوت).
         */
        if (st !== YT_PS.PLAYING && st !== YT_PS.BUFFERING) {
          p.mute();
          setMuted(true);
          p.playVideo();
        }
      }, delayMs);
      retryTimers.push(id);
    };
    const scheduleUnmuteAfterPlaybackStarts = () => {
      if (autoUnmuteOnceRef.current) return;
      autoUnmuteOnceRef.current = true;
      const idUnmute = window.setTimeout(() => {
        if (cancelled) return;
        const p = playerRef.current;
        if (!p) return;
        const st = p.getPlayerState();
        if (st === YT_PS.PAUSED || st === YT_PS.ENDED || st === YT_PS.UNSTARTED) {
          return;
        }
        p.setVolume(DEFAULT_VOLUME_PERCENT);
        p.unMute();
        setMuted(false);
        const idVerify = window.setTimeout(() => {
          if (cancelled) return;
          const p2 = playerRef.current;
          if (!p2) return;
          if (p2.isMuted()) {
            setMuted(true);
            return;
          }
          if (p2.getPlayerState() === YT_PS.PAUSED) {
            p2.mute();
            setMuted(true);
            p2.playVideo();
          }
        }, 320);
        retryTimers.push(idVerify);
      }, 220);
      retryTimers.push(idUnmute);
    };
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
            enablejsapi: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            iv_load_policy: 3,
            disablekb: 1,
            fs: 0,
            playsinline: 1,
            /* يطابق نطاق الصفحة مع توثيق YouTube IFrame API ويقلّل أخطاء postMessage على localhost. */
            origin: window.location.origin,
          },
          events: {
            onReady: (e) => {
              const target = e.target;
              target.setVolume(DEFAULT_VOLUME_PERCENT);
              target.mute();
              setMuted(true);
              target.playVideo();
              setReady(true);
              scheduleMutedAutoplayRetry(350);
              scheduleMutedAutoplayRetry(1100);
            },
            onStateChange: (e) => {
              const s = e.data;
              if (s === YT_PS.PLAYING) {
                setPlaying(true);
                scheduleUnmuteAfterPlaybackStarts();
              } else if (s === YT_PS.BUFFERING) {
                setPlaying(true);
              } else if (
                s === YT_PS.PAUSED ||
                s === YT_PS.ENDED ||
                s === YT_PS.UNSTARTED ||
                s === YT_PS.CUED
              ) {
                setPlaying(false);
              }
            },
            /*
             * أكواد الأخطاء من يوتيوب: 2 (ID خاطئ)، 5 (مشكلة بالـ HTML5 player)،
             * 100 (محذوف/مش موجود)، 101 و150 (الناشر منع التضمين). كلها نعتبرها فشل.
             */
            onError: () => onErrorRef.current?.(),
          },
        });
        playerRef.current = player;
      })
      .catch(() => onErrorRef.current?.());

    return () => {
      cancelled = true;
      for (const id of retryTimers) window.clearTimeout(id);
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
          if (next) {
            p.mute();
          } else {
            p.setVolume(DEFAULT_VOLUME_PERCENT);
            p.unMute();
          }
          setMuted(next);
        }}
      />
    </>
  );
}

/* ────────────────────  Vimeo embed (postMessage API)  ──────────────────── */

function VimeoEmbed({
  videoId,
  onError,
}: {
  videoId: string;
  onError?: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const vimeoUnmuteOnceRef = useRef(false);

  useEffect(() => {
    vimeoUnmuteOnceRef.current = false;
  }, [videoId]);

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
      if (data.event === "play") {
        setPlaying(true);
        if (!vimeoUnmuteOnceRef.current) {
          vimeoUnmuteOnceRef.current = true;
          window.setTimeout(() => {
            send("setVolume", DEFAULT_VOLUME_PERCENT / 100);
            send("setMuted", false);
            setMuted(false);
          }, 160);
        }
      } else if (data.event === "pause") setPlaying(false);
      else if (data.event === "error") onErrorRef.current?.();
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
        /* lazy يؤخر تحميل الـ iframe فـ autoplay من فيميو يبقى غير موثوق للفيديو البارز */
        loading="eager"
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={() => {
          send("addEventListener", "play");
          send("addEventListener", "pause");
          send("addEventListener", "error");
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
          if (!next) send("setVolume", DEFAULT_VOLUME_PERCENT / 100);
          send("setMuted", next);
          setMuted(next);
        }}
      />
    </>
  );
}

/* ─────────────────────────  Direct video file  ─────────────────────────── */

function DirectVideoEmbed({
  src,
  poster,
  onError,
}: {
  src: string;
  poster?: string;
  onError?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  /*
   * نبدأ مكتوم لضمان autoplay، وبعد ما الفيديو يبدأ play بنحاول نفك الكتم
   * ونضبط الصوت على 30٪. لو المتصفح رفض (موبايل/سفاري) بنرجّع state إلى
   * muted=true عشان الـ UI يعكس الواقع الفعلي.
   */
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  /** يمنع طلب play() مئات المرات مع كل حدث canplay أثناء التخزين المؤقت. */
  const autoplayCommittedRef = useRef(false);
  /** بعد تشغيل مكتوم (مسار catch)، نجرب الصوت مرة عند أول play فعلي. */
  const unmuteOnFirstPlayRef = useRef(false);

  useEffect(() => {
    autoplayCommittedRef.current = false;
    unmuteOnFirstPlayRef.current = false;
  }, [src]);

  const attemptAutoplay = useCallback(() => {
    const el = videoRef.current;
    if (!el || autoplayCommittedRef.current) return;
    el.volume = DEFAULT_VOLUME_PERCENT / 100;
    el.muted = true;
    setMuted(true);
    void el
      .play()
      .then(() => {
        autoplayCommittedRef.current = true;
        setPlaying(true);
        el.muted = false;
        setMuted(false);
        window.setTimeout(() => {
          if (el.muted) setMuted(true);
        }, 80);
      })
      .catch(() => {
        /*
         * سياسات autoplay: أحياناً لازم يفضل مكتوم حتى ينجح play().
         * لو فشل حتى وهو مكتوم (توفير بيانات/تبويب خلفي) نعرض زر التشغيل.
         */
        el.muted = true;
        setMuted(true);
        void el
          .play()
          .then(() => {
            autoplayCommittedRef.current = true;
            setPlaying(true);
          })
          .catch(() => setPlaying(false));
      });
  }, []);

  useEffect(() => {
    attemptAutoplay();
  }, [src, attemptAutoplay]);

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
        /* metadata فقط كانت تؤخر تحميل أول إطار فـ loadeddata/canplay يتأخران و autoplay يفشل */
        preload="auto"
        onLoadedMetadata={() => attemptAutoplay()}
        onCanPlay={() => attemptAutoplay()}
        onError={() => {
          setPlaying(false);
          onErrorRef.current?.();
        }}
        onPlay={() => {
          setPlaying(true);
          const el = videoRef.current;
          if (!el || unmuteOnFirstPlayRef.current) return;
          unmuteOnFirstPlayRef.current = true;
          if (!el.muted) return;
          el.volume = DEFAULT_VOLUME_PERCENT / 100;
          el.muted = false;
          setMuted(false);
          window.setTimeout(() => {
            if (el.muted) setMuted(true);
          }, 80);
        }}
        onPause={() => setPlaying(false)}
      />
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
          const el = videoRef.current;
          if (el) {
            if (!next) el.volume = DEFAULT_VOLUME_PERCENT / 100;
            el.muted = next;
            if (!next) void el.play().catch(() => undefined);
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
  /* لو فشل التشغيل لأي سبب: نعرض الصورة فقط، أو نخفي البوكس بالكامل لو مفيش صورة. */
  const [hasError, setHasError] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  /* نرجّع state لو حضرتك غيّرت الرابط من /control. */
  useEffect(() => {
    setHasError(false);
    setPosterFailed(false);
  }, [src, poster]);

  const handleError = useCallback(() => setHasError(true), []);

  if (!video.enabled || !src) return null;
  /* فشل + (مفيش poster أو الـposter نفسه فشل) = نخفي البوكس خالص. */
  if (hasError && (!poster || posterFailed)) return null;

  return (
    <section
      className={cn(
        /*
         * عرض كامل على الموبايل/التابلت، وعلى الشاشات الكبيرة بنحدّد سقف
         * عرض (1100px) ونوسطه عشان الفيديو ميكبرش لدرجة تظهر فيها مساحات سودا
         * حواليه (pillarbox).
         */
        "mx-auto min-w-0 w-full max-w-[1100px] overflow-hidden rounded-2xl bg-black shadow-[0_16px_42px_-30px_rgba(15,23,42,0.65)]",
        className,
      )}
      aria-label="فيديو مميز"
    >
      {/* aspect-video = 16:9 يطابق نسبة فيديوهات يوتيوب فمافيش شرايط سودا داخل البلاير. */}
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {hasError ? (
          /* فشل التشغيل + فيه poster → نعرض الصورة بس بدون أي تحكم. لو الصورة كمان فشلت بنخفي البوكس فوق. */
          <AppImage
            src={poster}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1100px"
            usePlaceholderOnError={false}
            onLoadError={() => setPosterFailed(true)}
          />
        ) : embed?.kind === "youtube" ? (
          <YouTubeEmbed videoId={embed.videoId} onError={handleError} />
        ) : embed?.kind === "vimeo" ? (
          <VimeoEmbed videoId={embed.videoId} onError={handleError} />
        ) : (
          <DirectVideoEmbed src={src} poster={poster} onError={handleError} />
        )}
        {/* تدرّج خفيف فوق البلاير لتحسين تباين الزراير. لا يعترض النقرات. */}
        {!hasError ? (
          <div className="pointer-events-none absolute inset-0 z-[10] bg-gradient-to-t from-black/28 via-transparent to-black/10" />
        ) : null}
      </div>
    </section>
  );
}
