import Link from "next/link";
import { CONTACT_EMAIL, ROUTES, SITE_NAME } from "@/lib/constants";
import { mockCategories } from "@/features/categories/mock";
import { DesktopShell } from "@/components/layout/desktop-shell";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-border bg-white/70 backdrop-blur-sm">
      <DesktopShell className="py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-brand-950">
              روابط
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link className="hover:text-brand-900" href={ROUTES.HOME}>
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link className="hover:text-brand-900" href={ROUTES.PRODUCTS}>
                  المنتجات
                </Link>
              </li>
              <li>
                <Link className="hover:text-brand-900" href={ROUTES.CART}>
                  السلة
                </Link>
              </li>
              <li>
                <Link className="hover:text-brand-900" href={ROUTES.CHECKOUT}>
                  إتمام الطلب
                </Link>
              </li>
              <li>
                <Link className="hover:text-brand-900" href={ROUTES.ABOUT}>
                  من نحن
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-brand-900"
                  href={ROUTES.SERVICE_CENTERS}
                >
                  مراكز الخدمة
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-brand-950">
              التصنيفات
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {mockCategories.map((c) => (
                <li key={c.id}>
                  <Link
                    className="hover:text-brand-900"
                    href={ROUTES.CATEGORY(c.slug)}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div id="service">
            <h3 className="font-display text-lg font-semibold text-brand-950">
              خدمة العملاء
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">{CONTACT_EMAIL}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              القاهرة، مصر — دعم العملاء 10:00–18:00.
            </p>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {year} {SITE_NAME}. جميع الحقوق محفوظة.
        </div>
      </DesktopShell>
    </footer>
  );
}
