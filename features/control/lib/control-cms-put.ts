export function formatControlApiError(payload: { error?: unknown }): string {
  const e = payload.error;
  if (typeof e === "string") return e;
  if (e && typeof e === "object" && "formErrors" in e) {
    const f = e as {
      formErrors: string[];
      fieldErrors: Record<string, string[] | undefined>;
    };
    const fe = Object.values(f.fieldErrors)
      .filter(Boolean)
      .flat() as string[];
    const parts = [...(f.formErrors ?? []), ...fe];
    return parts.length > 0 ? parts.join(" — ") : "خطأ في التحقق من البيانات";
  }
  return "فشل الحفظ";
}

export async function putCmsRequest(key: string, data: unknown): Promise<void> {
  const res = await fetch("/api/control/cms", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, data }),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: unknown };
    throw new Error(formatControlApiError(j));
  }
}
