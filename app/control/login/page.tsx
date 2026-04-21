"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
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
    <div className="min-h-[70vh] bg-page py-12">
      <Container className="max-w-md">
        <h1 className="font-display text-2xl font-bold text-brand-950">لوحة التحكم</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          سجّل الدخول بحساب مسموح (مُعرّف المستخدم في CONTROL_PANEL_ALLOWED_UIDS).
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="ctrl-email">
              البريد
            </label>
            <input
              id="ctrl-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="ctrl-pass">
              كلمة المرور
            </label>
            <input
              id="ctrl-pass"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base"
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
      </Container>
    </div>
  );
}
