"use client";

import { Link } from "next-view-transitions";
import { Container } from "@/components/Container";
import { ROUTES } from "@/lib/constants";
import { useAuthSession } from "@/hooks/useAuthSession";

/*
 * صفحة الحساب (/account): عمود واحد داخل Container؛ حالات التحميل والضيف والمسجّل.
 * عند تسجيل الدخول: شبكة من ثلاث بطاقات من md (md:grid-cols-3) لأقسام الطلبات/الملف/العناوين.
 */
export function AccountPageContent() {
  const { hasHydrated, isAuthenticated } = useAuthSession();

  if (!hasHydrated) {
    return (
      <Container className="py-10">
        {/* انتظار اكتمال التخزين المؤقت للجلسة على العميل */}
        <h1 className="font-display text-xl font-semibold text-brand-950 sm:text-2xl md:text-3xl">
          الحساب
        </h1>
        <p className="mt-4 rounded-xl border border-border bg-surface-muted/30 px-4 py-3 text-sm text-brand-900">
          جاري التحميل…
        </p>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container className="py-10">
        {/* زائر غير مسجّل: رسالة داخل نفس تخطيط العنوان */}
        <h1 className="font-display text-xl font-semibold text-brand-950 sm:text-2xl md:text-3xl">
          الحساب
        </h1>
        <p className="mt-4 rounded-xl border border-border bg-surface-muted/30 px-4 py-3 text-sm text-brand-900">
          يلزم تسجيل الدخول لعرض بيانات حسابك وطلباتك.
        </p>
        <Link
          href={ROUTES.LOGIN}
          className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-brand-500 px-6 text-sm font-bold text-black hover:bg-brand-400"
        >
          تسجيل الدخول
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <h1 className="font-display text-xl font-semibold text-brand-950 sm:text-2xl md:text-3xl">
        الحساب
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        إدارة ملفك الشخصي وعناوينك ستُربط لاحقاً بووكومرس.
      </p>

      {/* من md: ثلاث أعمدة متساوية لبطاقات الأقسام؛ تحت md عمود واحد متتابع */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <section className="rounded-lg border border-brand-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold">الطلبات</h2>
          <p className="mt-2 text-sm text-zinc-600">
            اعرض كل طلباتك وحالتها في صفحة مخصصة.
          </p>
          <Link
            href={ROUTES.MY_ORDERS}
            className="mt-4 inline-flex text-sm font-semibold text-brand-800 underline-offset-4 hover:underline"
          >
            عرض طلباتي
          </Link>
        </section>
        <section className="rounded-lg border border-brand-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold">الملف الشخصي</h2>
          <p className="mt-2 text-sm text-zinc-600">تعديل البيانات قيد الإعداد.</p>
        </section>
        <section className="rounded-lg border border-brand-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold">العناوين</h2>
          <p className="mt-2 text-sm text-zinc-600">دفتر العناوين قيد الإعداد.</p>
        </section>
      </div>
    </Container>
  );
}
