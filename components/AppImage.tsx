"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { toAbsoluteSiteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

const PLACEHOLDER_PATH = "/images/placeholder.png";

function normalizeSrc(value: ImageProps["src"]): ImageProps["src"] {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return toAbsoluteSiteUrl(PLACEHOLDER_PATH);
  if (trimmed.startsWith("/")) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return toAbsoluteSiteUrl(trimmed);
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
}: Pick<ImageProps, "src" | "alt" | "className" | "fill" | "sizes" | "priority" | "width" | "height">) {
  const [currentSrc, setCurrentSrc] = useState(() => normalizeSrc(src));

  useEffect(() => {
    setCurrentSrc(normalizeSrc(src));
  }, [src]);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      className={cn("object-cover", className)}
      fill={fill}
      sizes={sizes}
      priority={priority}
      width={width}
      height={height}
      onError={() => setCurrentSrc(PLACEHOLDER_PATH)}
    />
  );
}
