/** Human-readable one-line summary for Woo `shipping_lines` on the order. */
export function formatWooShippingLines(value: unknown): string | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }
  const parts: string[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const title = o.method_title;
    const total = o.total;
    if (title == null && total == null) {
      continue;
    }
    const t = [title, total != null ? String(total) : null]
      .filter((x) => x != null && String(x).trim() !== "")
      .join(" — ");
    if (t) {
      parts.push(t);
    }
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

/** One-line for Woo `coupon_lines` on the order. */
export function formatWooCouponLines(value: unknown): string | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }
  const parts: string[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const code = o.code;
    const discount = o.discount;
    if (code == null && discount == null) {
      continue;
    }
    const t = [code, discount != null ? String(discount) : null]
      .filter((x) => x != null && String(x).trim() !== "")
      .join(" — ");
    if (t) {
      parts.push(t);
    }
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

