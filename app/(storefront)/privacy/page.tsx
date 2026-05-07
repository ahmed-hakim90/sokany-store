import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/layout/legal-page-shell";
import { SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

const title = `سياسة الخصوصية | ${SITE_BRAND_TITLE_AR}`;
const description =
  "سياسة الخصوصية وحماية البيانات لدى مؤسسة المغربى، وكيفية جمع واستخدام وحماية بيانات العملاء.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/privacy`,
    siteName: SITE_BRAND_TITLE_AR,
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/privacy` },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPageShell dir="rtl" lang="ar">
      <header className="mb-6 border-b border-border/80 pb-6 sm:mb-8">
        <h1 className="text-right font-display text-2xl font-bold text-brand-950 md:text-3xl">
          سياسة الخصوصية وحماية البيانات
        </h1>
      </header>

      <article className="prose prose-sm max-w-none text-right text-brand-950 sm:prose-base prose-headings:font-display prose-headings:text-brand-950 prose-p:leading-8 prose-li:leading-8 prose-a:font-medium prose-a:text-brand-800 prose-a:no-underline hover:prose-a:underline">
        <section>
          <h2>1. مقدمة</h2>
          <p>
            فى مؤسسة المغربى نحترم خصوصيتك وملتزمون بحماية بياناتك الشخصية. توضح هذه
            السياسة كيف نقوم بجمع معلوماتك واستخدامها وحمايتها عند تفاعلك مع موقعنا
            الإلكتروني{" "}
            <a href="https://www.sokany-eg.com" target="_blank" rel="noopener noreferrer">
              www.sokany-eg.com
            </a>
            . وباستخدامك لموقعنا، فإنك توافق على الممارسات الموضحة أدناه.
          </p>
        </section>

        <section>
          <h2>2. المعلومات التي نقوم بجمعها</h2>
          <h3>أ. المعلومات الشخصية التي تُقدمها أنت</h3>
          <ul>
            <li>الاسم، البريد الإلكتروني، رقم الهاتف، عناوين الشحن والفوترة.</li>
            <li>تفاصيل الدفع، ويتم معالجتها بأمان من خلال شركاء دفع موثوقين.</li>
            <li>تفاصيل تسجيل الحساب، مثل اسم المستخدم وكلمة المرور.</li>
          </ul>

          <h3>ب. المعلومات التي يتم جمعها تلقائيًا</h3>
          <ul>
            <li>نوع الجهاز والمتصفح، عنوان الـ IP، نظام التشغيل.</li>
            <li>
              بيانات الكوكيز والتحليلات، مثل Google Analytics وFacebook Pixel وغيرها، والتي
              تشمل الصفحات التي تمت زيارتها، مدة التصفح، المواقع المُحيلة، والموقع الجغرافي
              استنادًا إلى عنوان الـ IP.
            </li>
          </ul>

          <h3>ج. المحتوى الذي ينشئه المستخدم</h3>
          <p>المراجعات أو التعليقات أو الملاحظات التي يتم تقديمها على موقعنا الإلكتروني.</p>
        </section>

        <section>
          <h2>3. كيف نستخدم معلوماتك؟</h2>
          <p>نستخدم بياناتك من أجل:</p>
          <ul>
            <li>معالجة طلباتك وتسليمها، وكذلك التعامل مع المرتجعات والمبالغ المستردة.</li>
            <li>إرسال التحديثات المتعلقة بالمعاملات وخدمة العملاء.</li>
            <li>
              إرسال رسائل تسويقية وترويجية عبر البريد الإلكتروني فقط في حال الاشتراك، ويمكنك
              إلغاء الاشتراك في أي وقت.
            </li>
            <li>تحسين أداء الموقع، وتحليل حركة المرور، وتخصيص تجربة التسوق الخاصة بك.</li>
          </ul>
        </section>

        <section>
          <h2>4. مشاركة المعلومات مع أطراف ثالثة</h2>
          <p>قد تتم مشاركة بياناتك مع:</p>
          <ul>
            <li>معالجي الدفع، مثل البنوك وبوابات الدفع.</li>
            <li>شركاء الشحن والتوصيل.</li>
            <li>الشركات المصنعة أو مراكز الخدمة المعتمدة فيما يتعلق بالضمان أو الاسترجاع.</li>
            <li>منصات التحليلات والإعلانات، مثل Google Analytics وFacebook.</li>
          </ul>
          <p>نحن لا نبيع أو نؤجر معلوماتك الشخصية لأي طرف ثالث لأغراض تسويقية.</p>
        </section>

        <section>
          <h2>5. ملفات تعريف الارتباط (Cookies) وتقنيات التتبع</h2>
          <p>نستخدم ملفات تعريف الارتباط (الكوكيز) من أجل:</p>
          <ul>
            <li>إبقاء حسابك قيد تسجيل الدخول والحفاظ على محتويات سلة التسوق.</li>
            <li>تتبع سلوك التصفح، مثل مدة التصفح والصفحات التي تم زيارتها.</li>
            <li>عرض إعلانات مخصصة لك على منصات شركائنا.</li>
          </ul>
          <p>
            يمكنك تعطيل الكوكيز من إعدادات متصفحك، لكن قد لا تعمل بعض ميزات الموقع بشكل
            صحيح نتيجة لذلك.
          </p>
        </section>

        <section>
          <h2>6. الاحتفاظ بالبيانات والأمان</h2>
          <ul>
            <li>
              <strong>بيانات الطلبات:</strong> يتم الاحتفاظ بها لمدة 5 سنوات وفقًا لما
              تقتضيه لوائح التجارة الإلكترونية في مصر.
            </li>
            <li>
              <strong>بيانات الحساب:</strong> يتم تخزينها حتى تطلب حذفها.
            </li>
            <li>
              <strong>الأمان:</strong> جميع صفحات الموقع محمية بتقنية تشفير SSL/TLS. نتبع
              معايير الأمان المعتمدة في الصناعة لمنع الوصول غير المصرح به إلى بياناتك.
            </li>
          </ul>
        </section>

        <section>
          <h2>7. حقوقك</h2>
          <p>يحق لك:</p>
          <ul>
            <li>الوصول إلى بياناتك الشخصية.</li>
            <li>تحديث أو تصحيح المعلومات غير الدقيقة.</li>
            <li>طلب حذف أو إلغاء تنشيط حسابك.</li>
            <li>إلغاء الاشتراك من الرسائل الترويجية في أي وقت.</li>
          </ul>
          <p>لممارسة هذه الحقوق، يُرجى التواصل معنا.</p>
        </section>

        <section>
          <h2>8. خصوصية الأطفال</h2>
          <p>
            خدماتنا غير موجهة للأشخاص دون سن 16 عامًا. إذا كنت دون 16 عامًا، يمكنك استخدام
            هذا الموقع فقط تحت إشراف أحد الوالدين.
          </p>
        </section>

        <section>
          <h2>9. التعديلات على هذه السياسة</h2>
          <p>
            قد نقوم بتحديث هذه السياسة من وقت لآخر. سيتم نشر التحديثات في هذه الصفحة، ويُعد
            استمرارك في استخدام الموقع موافقةً على الشروط المعدّلة.
          </p>
        </section>

        <section>
          <h2>10. معلومات الاتصال</h2>
          <p>للاستفسارات المتعلقة ببياناتك أو حقوق الخصوصية:</p>
          <p>
            البريد الإلكتروني:{" "}
            <a href="mailto:info@sokanyelmaghraby.com">info@sokanyelmaghraby.com</a>
          </p>
        </section>
      </article>

      <p className="mt-8 border-t border-border/80 pt-6 text-center text-xs text-muted-foreground sm:mt-10">
        <Link href="/" className="font-medium text-brand-800 underline-offset-2 hover:underline">
          العودة للمتجر
        </Link>
      </p>
    </LegalPageShell>
  );
}
