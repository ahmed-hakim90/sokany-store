/**
 * ترجمة أخطاء الـ BFF للواجهة (عربي + هل يستحق إعادة المحاولة).
 * بالعامية: نستخدمها في شاشات فشل التحميل بدل نصوص متفرقة.
 */
export type StorefrontApiErrorCopy = {
  title: string;
  description: string;
  retryable: boolean;
};

export function getStorefrontApiErrorCopy(
  status: number | undefined,
): StorefrontApiErrorCopy {
  if (status === 401 || status === 403) {
    return {
      title: "غير مصرّح",
      description: "لم يُسمح بهذا الطلب. سجّل الدخول إن لزم أو حدّث الصفحة.",
      retryable: false,
    };
  }
  if (status === 404) {
    return {
      title: "غير موجود",
      description: "المورد المطلوب غير متوفر حالياً.",
      retryable: false,
    };
  }
  if (status === 429) {
    return {
      title: "طلبات كثيرة",
      description: "تم الإبطاء مؤقتاً بسبب كثرة الطلبات. انتظر قليلاً ثم أعد المحاولة.",
      retryable: true,
    };
  }
  if (status != null && status >= 500) {
    return {
      title: "الخادم مشغول",
      description: "الخدمة غير متاحة مؤقتاً. أعد المحاولة بعد لحظات.",
      retryable: true,
    };
  }
  return {
    title: "تعذّر تحميل البيانات",
    description:
      "حصلت مشكلة أثناء الاتصال. تحقق من الشبكة ثم جرّب إعادة المحاولة.",
    retryable: true,
  };
}
