import { normalizeArabicText } from "./arabic-normalize";
import type { AssistantPageContext } from "@/features/assistant/types";

export type AssistantIntent =
  | "lowestPrice"
  | "productRecommendation"
  | "productCompare"
  | "productDetails"
  | "branches"
  | "retailers"
  | "policy"
  | "general";

export function detectAssistantIntent(
  question: string,
  pageContext?: AssistantPageContext,
): AssistantIntent {
  const normalized = normalizeArabicText(question);
  if (/(فروع|فرع|صيان|صيانه|مركز|مراكز|عنوان|عناوين|فين)/.test(normalized)) {
    return "branches";
  }
  if (/(موزع|موزعين|معرض|معارض|نقاط بيع|اشتري منين)/.test(normalized)) {
    return "retailers";
  }
  if (/(ضمان|استرجاع|استبدال|خصوصيه|شروط|احكام|سياسه)/.test(normalized)) {
    return "policy";
  }
  if (
    /(قارن|مقارنه|فرق|الفرق|احسن بينهم|ايهما)/.test(normalized)
  ) {
    return "productCompare";
  }
  if (
    /(اقل سعر|ارخص|رخيص|بكام|سعر)/.test(normalized) &&
    /(اقل|ارخص|رخيص)/.test(normalized)
  ) {
    return "lowestPrice";
  }
  if (
    pageContext?.pageType === "product" &&
    !/(رشح|رشحلي|اقترح|بديل|بدائل|قارن|مقارنه)/.test(normalized)
  ) {
    return "productDetails";
  }
  if (
    /(رشح|رشحلي|اقترح|انصحني|افضل|احسن|ميزانيه|تحت|لحد|مناسب)/.test(
      normalized,
    )
  ) {
    return "productRecommendation";
  }
  if (
    pageContext?.pageType === "product" ||
    /(منتج|موديل|مواصفات|ينفع|مناسب|عيوبه|مميزاته)/.test(normalized)
  ) {
    return "productDetails";
  }
  return "general";
}

export function intentLabel(intent: AssistantIntent): string {
  return intent;
}
