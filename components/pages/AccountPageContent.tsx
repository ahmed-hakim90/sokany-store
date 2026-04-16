"use client";

import { Container } from "@/components/Container";
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
          Account
        </h1>
        <p className="mt-4 rounded-xl border border-border bg-surface-muted/30 px-4 py-3 text-sm text-brand-900">
          Loading account…
        </p>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container className="py-10">
        {/* زائر غير مسجّل: رسالة داخل نفس تخطيط العنوان */}
        <h1 className="font-display text-xl font-semibold text-brand-950 sm:text-2xl md:text-3xl">
          Account
        </h1>
        <p className="mt-4 rounded-xl border border-border bg-surface-muted/30 px-4 py-3 text-sm text-brand-900">
          Login required
        </p>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <h1 className="font-display text-xl font-semibold text-brand-950 sm:text-2xl md:text-3xl">
        Account
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        This area is a stub — wiring to orders and profile will come later.
      </p>

      {/* من md: ثلاث أعمدة متساوية لبطاقات الأقسام؛ تحت md عمود واحد متتابع */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <section className="rounded-lg border border-brand-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold">Orders</h2>
          <p className="mt-2 text-sm text-zinc-600">No orders displayed yet.</p>
        </section>
        <section className="rounded-lg border border-brand-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold">Profile</h2>
          <p className="mt-2 text-sm text-zinc-600">Profile editing is stubbed.</p>
        </section>
        <section className="rounded-lg border border-brand-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold">Addresses</h2>
          <p className="mt-2 text-sm text-zinc-600">Address book is stubbed.</p>
        </section>
      </div>
    </Container>
  );
}
