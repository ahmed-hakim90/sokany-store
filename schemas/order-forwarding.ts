import { z } from "zod";

export const DEFAULT_ORDER_FORWARDING_SECRET_HEADER_NAME = "x-api-secret" as const;

const httpHeaderNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9!#$%&'*+.^_`|~-]+$/, "اسم الهيدر غير صالح");

const optionalUrlSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().url().max(1000).optional());

export const orderForwardingSettingsPrivateSchema = z.object({
  enabled: z.boolean().default(false),
  apiUrl: optionalUrlSchema,
  secretHeaderName: httpHeaderNameSchema.default(
    DEFAULT_ORDER_FORWARDING_SECRET_HEADER_NAME,
  ),
  secret: z.string().max(4096).optional(),
  updatedAt: z.unknown().optional(),
});

export type OrderForwardingSettingsPrivate = z.infer<
  typeof orderForwardingSettingsPrivateSchema
>;

export const orderForwardingSettingsPublicSchema = z.object({
  enabled: z.boolean(),
  apiUrl: optionalUrlSchema,
  secretHeaderName: httpHeaderNameSchema,
  hasSecret: z.boolean(),
  updatedAt: z.unknown().optional(),
});

export type OrderForwardingSettingsPublic = z.infer<
  typeof orderForwardingSettingsPublicSchema
>;

export const orderForwardingSettingsPutSchema = z.object({
  enabled: z.boolean(),
  apiUrl: optionalUrlSchema,
  secretHeaderName: httpHeaderNameSchema.default(
    DEFAULT_ORDER_FORWARDING_SECRET_HEADER_NAME,
  ),
  secret: z
    .string()
    .max(4096)
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : undefined;
    }),
  clearSecret: z.boolean().optional(),
});

export type OrderForwardingSettingsPut = z.infer<
  typeof orderForwardingSettingsPutSchema
>;

export function toPublicOrderForwardingSettings(
  settings: OrderForwardingSettingsPrivate,
): OrderForwardingSettingsPublic {
  return {
    enabled: settings.enabled,
    apiUrl: settings.apiUrl,
    secretHeaderName:
      settings.secretHeaderName || DEFAULT_ORDER_FORWARDING_SECRET_HEADER_NAME,
    hasSecret: Boolean(settings.secret?.trim()),
    updatedAt: settings.updatedAt,
  };
}
