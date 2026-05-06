import { useCallback, useRef, type PointerEvent } from "react";

const SWIPE_THRESHOLD_PX = 40;
const TAP_MAX_MOVE_PX = 14;

type UsePointerSwipeOptions = {
  enabled: boolean;
  onSwipeNext: () => void;
  onSwipePrev: () => void;
  /** If omitted, pointer up never triggers a tap action. */
  onTap?: () => void;
};

/**
 * Horizontal pointer swipe (touch / mouse). Optional tap when movement stays small.
 * Swipe left (negative dx) → next; swipe right → prev (same as common photo galleries).
 */
export function usePointerSwipe({
  enabled,
  onSwipeNext,
  onSwipePrev,
  onTap,
}: UsePointerSwipeOptions) {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (!enabled) return;
      startRef.current = { x: e.clientX, y: e.clientY };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [enabled],
  );

  const finish = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (!enabled) return;
      const start = startRef.current;
      startRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      if (!start) return;

      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;

      if (Math.abs(dx) >= SWIPE_THRESHOLD_PX && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) onSwipeNext();
        else onSwipePrev();
        return;
      }

      if (
        onTap &&
        Math.abs(dx) < TAP_MAX_MOVE_PX &&
        Math.abs(dy) < TAP_MAX_MOVE_PX
      ) {
        onTap();
      }
    },
    [enabled, onSwipeNext, onSwipePrev, onTap],
  );

  const onPointerUp = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      finish(e);
    },
    [finish],
  );

  const onPointerCancel = useCallback(() => {
    startRef.current = null;
  }, []);

  return {
    onPointerDown,
    onPointerUp,
    onPointerCancel,
  };
}
