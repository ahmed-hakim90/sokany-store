# صور شريط التصنيفات (Home Category Image Scroller)

ضع هنا صور التايلز اللي تظهر تحت بانر الهوم مباشرة في الصفحة الرئيسية.
حالياً المصادر يدوية من
[features/home/constants/home-category-tiles.ts](../../../features/home/constants/home-category-tiles.ts)
لحين توفّر الـ API.

## المواصفات الموصى بها

- المقاس: **240×120** (نسبة 2:1) — أو مضاعفاتها (مثل 480×240 للريتنا).
- الصيغة: WebP أو JPG (مدعوم: webp / avif / jpg / jpeg / png / gif).
- الجودة: 80–90%.

## كيف تضيف/تستبدل تايل

1. ضع الصورة في هذا الفولدر باسم واضح (يفضل بادئة رقمية للترتيب)، مثلاً:

```
/public/images/categories/
  01-kitchen.jpg
  02-coffee.jpg
  03-personal.jpg
```

2. افتح
[features/home/constants/home-category-tiles.ts](../../../features/home/constants/home-category-tiles.ts)
وأضف/عدّل عنصر بنفس الـ shape:

```ts
{
  imageSrc: "/images/categories/04-new-tile.jpg",
  imageAlt: "وصف للتايل بالعربي",
  href: ROUTES.CATEGORY("slug"), // أو رابط اختياري
}
```

## ملاحظات

- التايل بدون `href` يظهر كصورة فقط بدون رابط.
- لما الـ API يجهز، احذف ملف الـ constants واستبدله بـ hook (`useHomeCategoryTiles`)
  يرجّع نفس `HomeCategoryTile[]`.
