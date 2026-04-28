import { z } from "zod";

/** نموذج صفحة `/login` — بريد + كلمة مرور ووكومرس (نفس منطق إنشاء الحساب مع الطلب). */
export const storefrontLoginFormSchema = z.object({
  email: z.string().trim().email("أدخل بريداً صالحاً"),
  password: z.string().min(1, "أدخل كلمة المرور"),
});

/** JSON body from `POST /api/auth/login` after a successful sign-in. */
export const loginSessionResponseSchema = z.object({
  token: z.string().min(1),
  userEmail: z.string(),
  userNicename: z.string(),
  userDisplayName: z.string(),
});

/** JSON body from `POST /api/auth/register` on success. */
export const registerResponseSchema = z.object({
  ok: z.literal(true),
  customerId: z.number().int().positive(),
});

/** JSON body from `POST /api/auth/logout` on success. */
export const logoutResponseSchema = z.object({
  ok: z.literal(true),
});
