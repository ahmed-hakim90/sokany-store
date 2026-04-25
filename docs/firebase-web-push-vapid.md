# إعداد مفتاح VAPID لإشعارات الويب (FCM)

إذا ظهرت رسالة **«مفتاح VAPID غير صالح»** فالمتصفح رفض المفتاح قبل الاتصال بالخادم. الحل من إعداد Firebase وليس من كود التطبيق فقط.

## الخطوات في Firebase Console

1. ادخل [Firebase Console](https://console.firebase.google.com) واختر **نفس المشروع** المستخدم في متغيرات `NEXT_PUBLIC_FIREBASE_PROJECT_ID` و`NEXT_PUBLIC_FIREBASE_APP_ID`.
2. **Project settings** (أيقونة الترس) → تبويب **Cloud Messaging**.
3. انزل إلى **Web Push certificates**.
4. إن لم يكن هناك زوج مفاتيح، اضغط **Generate key pair**.
5. انسخ **المفتاح العام (Public key)** — السلسلة الطويلة من أحرف وأرقام وشرطات فقط.

## ما الذي لا يُستخدم كـ VAPID

- **Legacy server key** من تبويب Cloud Messaging القديم.
- **Web API Key** من إعدادات المشروع العامة.
- أي مفتاح من Google Cloud غير قسم **Web Push certificates** لهذا المشروع.

## ملف البيئة

في `.env` أو `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_VAPID_KEY=الصق_المفتاح_العام_هنا_سطر_واحد
```

- بدون علامات اقتباس `"..."` إلا إذا كنت تعرف أن الملف يدعمها بشكل صحيح.
- بدون مسافة قبل أو بعد `=`.
- بعد الحفظ: **أعد تشغيل** `npm run dev` (متغيرات `NEXT_PUBLIC_*` تُقرأ عند الإقلاع).

## تحقق سريع

- طول المفتاح العام عادةً حوالي **87** حرفًا (قد يختلف قليلاً).
- إن استمر الخطأ، تأكد أن تطبيق الويب في Firebase يطابق نفس `appId` في المشروع.
