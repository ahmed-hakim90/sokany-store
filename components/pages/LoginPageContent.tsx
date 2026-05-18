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
import { surfacePageHeroClass, surfacePanelClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";
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
 * صفحة تسجيل الدخول (/login):
 * — الجوال: بطاقة مركزة للنموذج.
 * — من lg: عمود ترحيب (فوائد + ضيف) | عمود النموذج.
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

  const benefitsPanel = (
    <div className={cn(surfacePanelClass, "hidden p-6 lg:block")}>
      <h2 className="font-display text-lg font-bold text-brand-950">لماذا حساب سوكاني؟</h2>
      <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
        <li>متابعة الطلبات وحالتها من مكان واحد.</li>
        <li>تقييم المنتجات بعد الاستلام.</li>
        <li>نفس بيانات ووكومرس عند إنشاء حساب مع الطلب.</li>
      </ul>
      <p className="mt-6 text-sm text-brand-900/70">
        يمكنك إتمام الطلب كضيف من{" "}
        <Link href={ROUTES.CHECKOUT} className="font-semibold text-brand-800 underline">
          صفحة الدفع
        </Link>
        .
      </p>
    </div>
  );

  return (
    <div className="bg-page bg-gradient-to-b from-page via-[#e8edf5]/40 to-page">
      <Container className="py-10 sm:py-14">
        <header className={cn(surfacePageHeroClass, "mb-8")}>
          <h1 className="font-display text-2xl font-bold tracking-tight text-brand-950 sm:text-3xl">
            تسجيل الدخول
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            نفس حساب ووكومرس — تابع طلباتك وتقييماتك من مكان واحد.
          </p>
        </header>
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
          {benefitsPanel}
          <div className="mx-auto w-full max-w-md space-y-6 lg:max-w-none">
            <div className="lg:hidden">{headingBlock}</div>

        <form
          onSubmit={(e) => void onSubmit(e)}
          className={cn(surfacePanelClass, "space-y-4 p-5")}
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
        </div>
      </Container>
    </div>
  );
}
