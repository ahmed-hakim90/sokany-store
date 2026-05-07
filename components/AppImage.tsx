"use client";

import Image, { type ImageProps } from "next/image";
import { useMemo, useState } from "react";
import { toAbsoluteSiteUrl } from "@/lib/site";
import { isWooHostedProductImageUrl } from "@/lib/woo-image-bypass-optimizer";
import { cn } from "@/lib/utils";

const PLACEHOLDER_PATH = "/images/placeholder.png";

const SHIMMER_BLOCK =
  "bg-gradient-to-r from-image-well via-surface-muted to-image-well bg-[length:200%_100%] animate-shimmer";

function normalizeStringPath(trimmed: string): string {
  if (trimmed.startsWith("/")) return trimmed;
  if (trimmed.startsWith("blob:")) return trimmed;
  if (trimmed.startsWith("data:")) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return toAbsoluteSiteUrl(trimmed);
}

function resolveStringSrc(
  value: string,
  emptyShimmer: boolean,
): string | null {
  const t = value.trim();
  if (!t) {
    return emptyShimmer ? null : toAbsoluteSiteUrl(PLACEHOLDER_PATH);
  }
  return normalizeStringPath(t);
}

function ShimmerBox({
  fill,
  className,
}: {
  fill?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        SHIMMER_BLOCK,
        fill && "absolute inset-0 h-full w-full",
        className,
      )}
      aria-hidden
    />
  );
}

type StringImageInnerProps = Pick<
  ImageProps,
  | "alt"
  | "className"
  | "fill"
  | "sizes"
  | "priority"
  | "width"
  | "height"
  | "fetchPriority"
  | "quality"
> & {
  src: string;
  onLoadError?: () => void;
  usePlaceholderOnError?: boolean;
  emptyShimmer: boolean;
  shimmerUntilLoaded: boolean;
};

/** Remounts via ‎`key`‎ on parent when ‎`src`‎/flags change — no sync effect. */
function StringAppImageInner({
  src,
  alt,
  className,
  fill,
  sizes,
  priority,
  width,
  height,
  fetchPriority,
  quality,
  onLoadError,
  usePlaceholderOnError = true,
  emptyShimmer,
  shimmerUntilLoaded,
}: StringImageInnerProps) {
  const base = useMemo(
    () => resolveStringSrc(src, emptyShimmer),
    [src, emptyShimmer],
  );
  const [isLoaded, setIsLoaded] = useState(!shimmerUntilLoaded);
  /** عند ‎`usePlaceholderOnError`‎: استبدال الصورة بـ ‎`placeholder`‎. */
  const [placeholderSwap, setPlaceholderSwap] = useState(false);
  const [errorShimmer, setErrorShimmer] = useState(false);

  const stringSrc: string | null = placeholderSwap
    ? PLACEHOLDER_PATH
    : errorShimmer
      ? null
      : base;

  if (stringSrc === null) {
    return <ShimmerBox fill={fill} className={className} />;
  }

  return (
    <span
      className={cn(
        "relative block",
        fill && "h-full w-full",
        !fill && "inline-block",
      )}
    >
      {shimmerUntilLoaded && !isLoaded ? <ShimmerBox fill className="z-[1]" /> : null}
      <Image
        src={stringSrc}
        alt={alt}
        className={cn(
          "object-cover",
          className,
          shimmerUntilLoaded && !isLoaded && "relative z-0 opacity-0",
        )}
        fill={fill}
        sizes={sizes}
        priority={priority}
        fetchPriority={fetchPriority}
        quality={quality}
        unoptimized={
          isWooHostedProductImageUrl(stringSrc) ||
          stringSrc.startsWith("blob:") ||
          stringSrc.startsWith("data:")
        }
        loading={priority ? "eager" : "lazy"}
        width={width}
        height={height}
        onLoad={() => {
          setIsLoaded(true);
        }}
        onError={() => {
          onLoadError?.();
          if (usePlaceholderOnError) {
            setPlaceholderSwap(true);
            setIsLoaded(true);
            return;
          }
          setErrorShimmer(true);
        }}
      />
    </span>
  );
}

export function AppImage({
  src,
  alt,
  className,
  fill,
  sizes,
  priority,
  width,
  height,
  fetchPriority,
  quality,
  onLoadError,
  usePlaceholderOnError = true,
  /** عند ‎`src`‎ فارغ: شيمر بدل صورة ‎`/images/placeholder.png`‎. @default true */
  emptyShimmer = true,
  /** فوق الصورة حتى اكتمال التحميل. @default false */
  shimmerUntilLoaded = false,
}: Pick<
  ImageProps,
  | "src"
  | "alt"
  | "className"
  | "fill"
  | "sizes"
  | "priority"
  | "width"
  | "height"
  | "fetchPriority"
  | "quality"
> & {
  onLoadError?: () => void;
  usePlaceholderOnError?: boolean;
  emptyShimmer?: boolean;
  shimmerUntilLoaded?: boolean;
}) {
  if (typeof src !== "string") {
    return (
      <Image
        src={src}
        alt={alt}
        className={cn("object-cover", className)}
        fill={fill}
        sizes={sizes}
        priority={priority}
        fetchPriority={fetchPriority}
        quality={quality}
        loading={priority ? "eager" : "lazy"}
        width={width}
        height={height}
      />
    );
  }

  return (
    <StringAppImageInner
      key={`${src}|${emptyShimmer ? "e1" : "e0"}|${shimmerUntilLoaded ? "s1" : "s0"}`}
      src={src}
      alt={alt}
      className={className}
      fill={fill}
      sizes={sizes}
      priority={priority}
      width={width}
      height={height}
      fetchPriority={fetchPriority}
      quality={quality}
      onLoadError={onLoadError}
      usePlaceholderOnError={usePlaceholderOnError}
      emptyShimmer={emptyShimmer}
      shimmerUntilLoaded={shimmerUntilLoaded}
    />
  );
}
