/**
 * في ‎USE_MOCK‎ (تطوير محلي) تواريخ ‎`mockOrders`‎ ثابتة وغالباً «قديمة» فتخرج من نافذة الساعتين
 * لأهلية الإلغاء/التعديل — نُرجع «الآن» لحساب ‎`guestOrderActionEligibility`‎ وعروض ‎batch-view‎ فقط.
 */
export function mockOrderTimestampsForEligibility(): {
  date_created: string;
  date_created_gmt: string;
} {
  const now = new Date().toISOString();
  return { date_created: now, date_created_gmt: now };
}
