/**
 * Motion contract — mirrors :root vars in app/globals.css for framer-motion and TS callers.
 */

export const motionDuration = {
  instant: 0,
  xs: 0.15,
  sm: 0.2,
  md: 0.28,
  lg: 0.45,
  xl: 0.5,
} as const;

export const motionEase = {
  standard: [0.4, 0, 0.2, 1] as const,
  emphasized: [0.2, 0.8, 0.2, 1] as const,
  out: [0, 0, 0.2, 1] as const,
  /** Close to cubic-bezier(0.22, 1, 0.36, 1) used in mega menu */
  megaPanel: [0.22, 1, 0.36, 1] as const,
};

export const motionTransition = {
  megaPanelOpen: {
    duration: 0.18,
    ease: motionEase.megaPanel,
  },
  cartPeekSpring: {
    type: "spring" as const,
    stiffness: 400,
    damping: 32,
  },
} as const;
