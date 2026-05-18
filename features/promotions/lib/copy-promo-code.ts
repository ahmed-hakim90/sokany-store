import { dismissPromoBar } from "@/features/promotions/lib/promo-bar-dismiss";
import { toast } from "sonner";

function copyViaTextarea(text: string): boolean {
  if (typeof document === "undefined") return false;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}

export type CopyPromoCodeOptions = {
  /** يخفي الشريط/البلاطة لهذا الكود (حتى لو فشل النسخ). */
  dismissPromoBar?: boolean;
};

export async function copyPromoCode(
  code: string,
  options?: CopyPromoCodeOptions,
): Promise<boolean> {
  const trimmed = code.trim();
  if (!trimmed) return false;

  let ok = false;
  try {
    await navigator.clipboard.writeText(trimmed);
    ok = true;
  } catch {
    ok = copyViaTextarea(trimmed);
  }

  if (ok) {
    toast.success(`تم نسخ الكود: ${trimmed}`);
  } else {
    toast.error("تعذر نسخ الكود — انسخه يدوياً");
  }

  if (options?.dismissPromoBar) {
    dismissPromoBar(trimmed);
  }

  return ok;
}
