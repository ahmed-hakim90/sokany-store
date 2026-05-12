/**
 * يطبّق معرفات بوابات الدفع الفعلية في WooCommerce على جسم الطلب.
 * الواجهة ترسل ‎`cod`‎ أو ‎`card`‎ أو ‎`fawry`‎ أو ‎`paymob`‎؛ الخادم يستبدل cod/card بقيم البيئة إن وُجدت.
 * فوري وباي موب تُمرَّر كما هي (أو تُستبدل إن وُجد override في البيئة).
 * الافتراضي لـ ‎`card`‎ = نفس قيمة ‎`cod`‎ حتى لا يُرفض الطلب إذا لم تكن بوابة باسم ‎`card`‎ مفعّلة.
 */
export function applyWooPaymentGatewayEnvToOrderBody(body: Record<string, unknown>): void {
  const pm = body.payment_method;
  if (typeof pm !== "string") return;
  const codGateway = process.env.WOO_ORDER_PAYMENT_METHOD_COD?.trim() || "cod";
  const cardGateway =
    process.env.WOO_ORDER_PAYMENT_METHOD_CARD?.trim() || codGateway;
  const fawryGateway = process.env.WOO_ORDER_PAYMENT_METHOD_FAWRY?.trim() || "fawry";
  const paymobGateway = process.env.WOO_ORDER_PAYMENT_METHOD_PAYMOB?.trim() || "paymob";
  if (pm === "cod") {
    body.payment_method = codGateway;
    return;
  }
  if (pm === "card") {
    body.payment_method = cardGateway;
    return;
  }
  if (pm === "fawry") {
    body.payment_method = fawryGateway;
    return;
  }
  if (pm === "paymob") {
    body.payment_method = paymobGateway;
  }
}
