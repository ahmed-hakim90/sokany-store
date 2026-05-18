/** Shared product tile sizing — rails, grids, skeletons stay aligned. */

/** Horizontal rail / carousel card shell (width in `globals.css` `.product-rail-card-shell`). */
export const productRailCardShellClassName = "product-rail-card-shell";

/** Snap inset when the rail is full-bleed (outside `Container`). */
export const productRailScrollBleedClassName = "px-4 sm:px-6";

/** Grid cell: full width on mobile 2-col; cap stretch on desktop. */
export const productGridCellClassName =
  "min-w-0 w-full max-w-none lg:max-w-[17.5rem] lg:justify-self-center lg:mx-auto";

export const defaultProductGridClassName =
  "grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
