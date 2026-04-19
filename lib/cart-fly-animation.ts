const FLY_SIZE_PX = 25;
const DURATION_MS = 520;
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

/** Mobile bottom-nav cart tab vs desktop navbar cart control (matches `lg` breakpoint). */
export type CartFlyTarget = "mobile" | "desktop";

const SELECTOR: Record<CartFlyTarget, string> = {
  mobile: "[data-cart-fly-target='mobile']",
  desktop: "[data-cart-fly-target='desktop']",
};

function resolveTargetKind(): CartFlyTarget {
  if (typeof window === "undefined") return "mobile";
  return window.matchMedia("(min-width: 1024px)").matches ? "desktop" : "mobile";
}

function getTargetElement(kind: CartFlyTarget): HTMLElement | null {
  return document.querySelector<HTMLElement>(SELECTOR[kind]);
}

function lightVibrate(): void {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  try {
    navigator.vibrate(14);
  } catch {
    /* ignore */
  }
}

/**
 * Flies a small product image from a source element toward the cart affordance (mobile tab or desktop navbar).
 * No-ops when reduced motion is preferred or elements are missing.
 */
export function playCartFlyAnimation(options: {
  fromElement: HTMLElement | null;
  imageSrc: string;
  /** When true, skips flight (use Framer's `useReducedMotion()` on the client). */
  prefersReducedMotion?: boolean;
}): Promise<void> {
  const { fromElement, imageSrc, prefersReducedMotion } = options;

  if (prefersReducedMotion || typeof document === "undefined") {
    return Promise.resolve();
  }

  if (!fromElement || !imageSrc) {
    return Promise.resolve();
  }

  const from = fromElement.getBoundingClientRect();
  if (from.width < 4 || from.height < 4) {
    return Promise.resolve();
  }

  const kind = resolveTargetKind();
  let target = getTargetElement(kind);
  if (!target) {
    target = getTargetElement(kind === "desktop" ? "mobile" : "desktop");
  }
  if (!target) {
    return Promise.resolve();
  }

  const to = target.getBoundingClientRect();
  if (to.width < 2 || to.height < 2) {
    return Promise.resolve();
  }

  const shell = document.createElement("div");
  shell.setAttribute("aria-hidden", "true");
  shell.style.cssText = [
    "position:fixed",
    "pointer-events:none",
    "z-index:2147483646",
    "left:0",
    "top:0",
    "width:0",
    "height:0",
    "overflow:visible",
  ].join(";");

  const flyer = document.createElement("div");
  const borderRadius = Math.min(10, FLY_SIZE_PX / 2);
  flyer.style.cssText = [
    `position:absolute`,
    `left:${from.left}px`,
    `top:${from.top}px`,
    `width:${from.width}px`,
    `height:${from.height}px`,
    `border-radius:${borderRadius}px`,
    "overflow:hidden",
    "box-shadow:0 10px 28px -8px rgba(15,23,42,0.35),0 0 0 1px rgba(15,23,42,0.08)",
    "transform-origin:center center",
    "will-change:transform",
  ].join(";");

  const img = document.createElement("img");
  img.alt = "";
  img.draggable = false;
  img.style.cssText = "width:100%;height:100%;object-fit:cover;display:block";
  img.src = imageSrc;

  flyer.appendChild(img);
  shell.appendChild(flyer);
  document.body.appendChild(shell);

  const startCx = from.left + from.width / 2;
  const startCy = from.top + from.height / 2;
  const endCx = to.left + to.width / 2;
  const endCy = to.top + to.height / 2;
  const dx = endCx - startCx;
  const dy = endCy - startCy;
  const sx = FLY_SIZE_PX / from.width;
  const sy = FLY_SIZE_PX / from.height;

  const ready = img.decode
    ? img.decode().catch(() => undefined)
    : new Promise<void>((r) => {
        img.onload = () => r();
        img.onerror = () => r();
      });

  return ready.then(() => {
    return new Promise<void>((resolve) => {
      const anim = flyer.animate(
        [
          { transform: "translate(0px, 0px) scale(1)" },
          { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
        ],
        { duration: DURATION_MS, easing: EASING, fill: "forwards" },
      );
      anim.onfinish = () => {
        lightVibrate();
        shell.remove();
        resolve();
      };
      anim.oncancel = () => {
        shell.remove();
        resolve();
      };
    });
  });
}
