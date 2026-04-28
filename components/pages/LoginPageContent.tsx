"use client";

import axios from "axios";
import type { ZodError } from "zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Link } from "next-view-transitions";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { FormField } from "@/components/ui/form-field";
import { login } from "@/features/auth/services/login";
import { useAuthSession } from "@/hooks/useAuthSession";
import { ROUTES } from "@/lib/constants";
import { storefrontLoginFormSchema } from "@/schemas/auth";

function fieldErrorsFromLoginSchema(
  error: ZodError,
): Partial<{ email: string; password: string }> {
  const out: Partial<{ email: string; password: string }> = {};
  for (const issue of error.issues) {
    const path = issue.path[0];
    if (path === "email" || path === "password") {
      out[path] = issue.message;
    }
  }
  return out;
}

function loginFailureMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data && typeof error.response.data === "object") {
    const err = (error.response.data as { error?: unknown }).error;
    if (typeof err === "string" && err.length > 0) {
      return err;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "تعذر تسجيل الدخول. حاول مرة أخرى.";
}

/*
 * صفحة تسجيل الدخول (/login): بريد + كلمة مرور ووكومرس — نفس بيانات الحساب عند إنشاء عميل مع الطلب.
 * بعد النجاح: توجيه إلى `/account`. إن كانت الجلسة نشطة مسبقاً يُعاد التوجيه تلقائياً.
 */
export function LoginPageContent() {
  const router = useRouter();
  const { hasHydrated, isAuthenticated } = useAuthSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<{ email: string; password: string }>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;
    router.replace(ROUTES.ACCOUNT);
  }, [hasHydrated, isAuthenticated, router]);

  const showLoggedInRedirect = hasHydrated && isAuthenticated;

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFieldErrors({});
      const parsed = storefrontLoginFormSchema.safeParse({ email, password });
      if (!parsed.success) {
        setFieldErrors(fieldErrorsFromLoginSchema(parsed.error));
        toast.error("يرجى تصحيح الحقول.");
        return;
      }
      setSubmitting(true);
      try {
        await login({
          username: parsed.data.email,
          password: parsed.data.password,
        });
        toast.success("تم تسجيل الدخول.");
        router.push(ROUTES.ACCOUNT);
        router.refresh();
      } catch (err) {
        toast.error(loginFailureMessage(err));
      } finally {
        setSubmitting(false);
      }
    },
    [email, password, router],
  );

  const headingBlock = (
    <div>
      <h1 className="font-display text-xl font-semibold text-brand-950 sm:text-2xl md:text-3xl">
        تسجيل الدخول
      </h1>
      <p className="mt-2 text-sm text-brand-900/70">
        أدخل البريد الإلكتروني وكلمة المرور المستخدَمة في متجر ووكومرس — نفس الحساب الذي أنشأته عند إتمام الطلب إذا
        اخترت «إنشاء حساب».
      </p>
    </div>
  );

  if (!hasHydrated) {
    return (
      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-md space-y-6">
          {headingBlock}
          <p className="rounded-xl border border-border bg-surface-muted/30 px-4 py-3 text-sm text-brand-900">
            جاري التحميل…
          </p>
        </div>
      </Container>
    );
  }

  if (showLoggedInRedirect) {
    return (
      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-md space-y-6">
          {headingBlock}
          <p className="rounded-xl border border-border bg-surface-muted/30 px-4 py-3 text-sm text-brand-900">
            جاري التوجيه إلى حسابك…
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto max-w-md space-y-6">
        {headingBlock}

        <form
          onSubmit={(e) => void onSubmit(e)}
          className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm"
          noValidate
        >
          <FormField
            label="البريد الإلكتروني"
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            required
          />
          <FormField
            label="كلمة المرور"
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            required
          />
          <Button type="submit" size="lg" className="h-12 w-full font-bold" loading={submitting}>
            تسجيل الدخول
          </Button>
        </form>

        <p className="text-center text-sm text-brand-900/60">
          <Link
            href={ROUTES.HOME}
            className="font-semibold text-brand-800 underline-offset-4 hover:underline"
          >
            العودة للرئيسية
          </Link>
        </p>
      </div>
    </Container>
  );
}
