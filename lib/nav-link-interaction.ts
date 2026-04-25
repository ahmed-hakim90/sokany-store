/**
 * ردود فعل لمس/ضغط لروابط التنقّل. `touch-manipulation` يُقلّل تردّد التمرير المزدوج 300ms على iOS.
 */
export const navLinkPressableClass =
  "touch-manipulation select-none transition-[transform,opacity,background-color,box-shadow] duration-100 active:scale-[0.97] active:opacity-90";

/** تُكمل `hover:` على عناصر ليها خلفية عند المرور (الدرج وغيره) */
export const navLinkActiveSurfaceClass = "active:bg-black/[0.05] dark:active:bg-white/[0.06]";

export const bottomNavItemPressableClass = `${navLinkPressableClass} active:brightness-95`;
