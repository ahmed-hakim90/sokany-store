import { z } from "zod";

/**
 * وثيقة ‎`controlPanelAccess/{uid}‎ — صلاحيات مخصصة (أولوية على قوائم ‎`CONTROL_*_UIDS`‎).
 */
export const controlPanelAccessDocSchema = z.object({
  mode: z.enum(["full", "media"]),
  /** ‎`null` / غير موجود = جميع تبويبات ‎`full`‎. مصفوفة = فقط هذه المعرفات (ليس ‎`access`‎). */
  tabIds: z.array(z.string().min(1)).nullable().optional(),
  /** ‎`null` / غير موجود = أي مجلد فرعي تحت ‎`cms/site-media/`‎. */
  mediaSubfolders: z.array(z.string().min(1)).nullable().optional(),
});

export type ControlPanelAccessDoc = z.infer<typeof controlPanelAccessDocSchema>;

export const controlPanelAccessPutBodySchema = z
  .object({
    email: z.string().email().optional(),
    uid: z.string().min(1).optional(),
    mode: z.enum(["full", "media"]),
    tabIds: z.array(z.string().min(1)).nullable().optional(),
    mediaSubfolders: z.array(z.string().min(1)).nullable().optional(),
  })
  .refine((b) => Boolean(b.email?.trim() || b.uid?.trim()), {
    message: "مطلوب email أو uid",
  });

export type ControlPanelAccessPutBody = z.infer<typeof controlPanelAccessPutBodySchema>;
