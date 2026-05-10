/** عنوان العميل للحد من المعدل (يفضّل ‎`x-forwarded-for`‎ خلف البروكسي). */
export function getTrustedClientIp(request: { headers: Headers }): string {
  const xf = request.headers.get("x-forwarded-for");
  const first = xf?.split(",")[0]?.trim();
  if (first) return first;
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
