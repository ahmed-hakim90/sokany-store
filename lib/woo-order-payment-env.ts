/**
 * يطبّق معرفات بوابات الدفع الفعلية في WooCommerce على جسم الطلب.
 * الواجهة ترسل دائماً ‎`cod`‎ أو ‎`card`‎؛ الخادم يستبدلهما بقيم البيئة إن وُجدت.
 * الافتراضي لـ ‎`card`‎ = نفس قيمة ‎`cod`‎ حتى لا يُرفض الطلب إذا لم تكن بوابة باسم ‎`card`‎ مفعّلة.
 */
export function applyWooPaymentGatewayEnvToOrderBody(body: Record<string, unknown>): void {
  const pm = body.payment_method;
  if (typeof pm !== "string") return;
  const codGateway = process.env.WOO_ORDER_PAYMENT_METHOD_COD?.trim() || "cod";
  const cardGateway =
    process.env.WOO_ORDER_PAYMENT_METHOD_CARD?.trim() || codGateway;
  if (pm === "cod") {
    body.payment_method = codGateway;
    return;
  }
  if (pm === "card") {
    body.payment_method = cardGateway;
  }
}
