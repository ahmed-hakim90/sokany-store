"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/Button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { getFirebaseAuth } from "@/lib/firebase";

/*
 * صفحة دخول المشرف (/control/login): نموذج بريد وكلمة مرور (Firebase Email/Password)
 * ثم تبادل idToken مع كوكي جلسة httpOnly عبر POST /api/control/session.
 */
export default function ControlLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const cred = await signInWithEmailAndPassword(
        getFirebaseAuth(),
        email.trim(),
        password,
      );
      const idToken = await cred.user.getIdToken();
      const res = await fetch("/api/control/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? "فشل تسجيل الدخول");
        return;
      }
      router.replace("/control");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ غير متوقع");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-0 w-full min-h-dvh flex-1 flex-col justify-center bg-[#f6f9fc] px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <Card
          variant="summary"
          className="border border-slate-200/90 p-6 shadow-sm ring-1 ring-slate-900/5 sm:p-8"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            لوحة التحكم
          </p>
          <h1 className="font-display mt-1 text-2xl font-bold text-slate-900">تسجيل الدخول</h1>
          <p className="mt-2 text-sm text-slate-600">
            سجّل الدخول بحساب مسموح (مُعرّف المستخدم في CONTROL_PANEL_ALLOWED_UIDS).
          </p>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label
                className="mb-1 block text-sm font-medium text-slate-700"
                htmlFor="ctrl-email"
              >
                البريد
              </label>
              <input
                id="ctrl-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition-shadow focus:ring-2 focus:ring-slate-300/50"
                required
              />
            </div>
            <div>
              <label
                className="mb-1 block text-sm font-medium text-slate-700"
                htmlFor="ctrl-pass"
              >
                كلمة المرور
              </label>
              <input
                id="ctrl-pass"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition-shadow focus:ring-2 focus:ring-slate-300/50"
                required
              />
            </div>
            {error ? (
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "جاري الدخول…" : "دخول"}
            </Button>
          </form>
        </Card>
        <p className="mt-6 text-center text-sm text-slate-600">
          <Link
            href={ROUTES.HOME}
            className="font-medium text-slate-800 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-950"
          >
            العودة للمتجر
          </Link>
        </p>
      </div>
    </div>
  );
}
