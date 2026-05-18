"use client";

import { Link } from "next-view-transitions";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { logout } from "@/features/auth/services/logout";
import { useAuthSession } from "@/hooks/useAuthSession";
import { ROUTES, WHATSAPP_SUPPORT_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

const menuItemClass =
  "flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-brand-950 transition-colors hover:bg-surface-muted/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500";

export function HeaderAccountMenu() {
  const { hasHydrated, isAuthenticated, user } = useAuthSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const handleLogout = () => {
    close();
    void logout();
  };

  return (
    <div className="relative hidden lg:block" ref={rootRef}>
      <button
        type="button"
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-white text-brand-950 shadow-sm transition-colors hover:bg-surface-muted/50",
          open && "bg-surface-muted/60 ring-2 ring-brand-500/25",
        )}
        aria-label="الحساب"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <UserGlyph className="h-[18px] w-[18px]" />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute end-0 top-[calc(100%+0.5rem)] z-50 w-[min(100vw-2rem,17.5rem)] animate-fade-in overflow-hidden rounded-2xl border border-border/80 bg-white p-2 shadow-[var(--glass-shadow)]"
        >
          {!hasHydrated ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">جاري التحميل…</p>
          ) : isAuthenticated ? (
            <>
              <div className="border-b border-border/70 px-3 py-2.5">
                <p className="text-xs font-medium text-muted-foreground">مرحباً</p>
                <p className="truncate font-display text-sm font-semibold text-brand-950">
                  {user?.displayName?.trim() || user?.email || "حسابي"}
                </p>
              </div>
              <nav className="flex flex-col gap-0.5 py-1" aria-label="قائمة الحساب">
                <Link href={ROUTES.ACCOUNT} role="menuitem" className={menuItemClass} onClick={close}>
                  الملف الشخصي
                </Link>
                <Link href={ROUTES.MY_ORDERS} role="menuitem" className={menuItemClass} onClick={close}>
                  طلباتي
                </Link>
                <Link href={ROUTES.WISHLIST} role="menuitem" className={menuItemClass} onClick={close}>
                  المفضلة
                </Link>
                {WHATSAPP_SUPPORT_URL ? (
                  <a
                    href={WHATSAPP_SUPPORT_URL}
                    role="menuitem"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={menuItemClass}
                    onClick={close}
                  >
                    دعم واتساب
                  </a>
                ) : (
                  <Link href={ROUTES.CONTACT} role="menuitem" className={menuItemClass} onClick={close}>
                    خدمة العملاء
                  </Link>
                )}
              </nav>
              <div className="border-t border-border/70 pt-1">
                <button
                  type="button"
                  role="menuitem"
                  className={cn(menuItemClass, "text-destructive")}
                  onClick={handleLogout}
                >
                  تسجيل الخروج
                </button>
              </div>
            </>
          ) : (
            <nav className="flex flex-col gap-0.5 py-1" aria-label="تسجيل الدخول">
              <Link href={ROUTES.LOGIN} role="menuitem" className={menuItemClass} onClick={close}>
                تسجيل الدخول
              </Link>
              <Link href={ROUTES.LOGIN} role="menuitem" className={cn(menuItemClass, "bg-brand-50/80 font-semibold")} onClick={close}>
                إنشاء حساب
              </Link>
              <Link href={ROUTES.MY_ORDERS} role="menuitem" className={menuItemClass} onClick={close}>
                تتبع الطلب
              </Link>
              <Link href={ROUTES.WISHLIST} role="menuitem" className={menuItemClass} onClick={close}>
                المفضلة
              </Link>
              {WHATSAPP_SUPPORT_URL ? (
                <a
                  href={WHATSAPP_SUPPORT_URL}
                  role="menuitem"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={menuItemClass}
                  onClick={close}
                >
                  دعم واتساب
                </a>
              ) : null}
            </nav>
          )}
        </div>
      ) : null}
    </div>
  );
}

function UserGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
