import { Clock3, MapPin, Phone } from "lucide-react";
import type { FulfillmentOptions, Locale, PaymentMethod, StoreConfig } from "@/lib/api/contracts";
import { localizedField } from "@/lib/i18n/fields";
import { Alert } from "@/components/ui/alert";

export type InfoSlug = "about" | "contact" | "privacy" | "terms" | "returns" | "shipping" | "payment";

export function InfoPage({ slug, locale, config, fulfillment, paymentMethods }: { slug: InfoSlug; locale: Locale; config: StoreConfig | null; fulfillment: FulfillmentOptions | null; paymentMethods: PaymentMethod[] }) {
  const settings = config?.storeSettings;
  const title = titles[slug][locale];
  if (slug === "about") return <Shell title={title}><p className="max-w-3xl whitespace-pre-wrap text-lg leading-9 text-muted">{settings ? localizedField({ ar: settings.descriptionAr, en: settings.descriptionEn, generic: settings.description }, locale) || (locale === "ar" ? "النجوم تيليكوم متجر تقنية عربي أولًا يعتمد على بيانات المتجر المباشرة." : "Alnjoom Telecom is an Arabic-first technology store driven by live store data.") : locale === "ar" ? "تعذّر تحميل وصف المتجر حاليًا." : "The store description is currently unavailable."}</p></Shell>;
  if (slug === "contact") return <Shell title={title}>{settings ? <div className="grid gap-4 sm:grid-cols-2"><Card icon={Phone} label={locale === "ar" ? "الهاتف" : "Phone"} value={settings.phone} /><Card icon={MapPin} label={locale === "ar" ? "العنوان" : "Address"} value={[settings.address, settings.city, settings.country].filter(Boolean).join("، ")} /><div className="surface-card p-5 sm:col-span-2"><h2 className="mb-3 flex items-center gap-2 font-bold"><Clock3 className="size-5 text-brand" />{locale === "ar" ? "ساعات العمل" : "Working hours"}</h2>{settings.workingHours.length ? <ul className="grid gap-2 sm:grid-cols-2">{settings.workingHours.map((day) => <li key={day.day} className="flex justify-between gap-3 rounded-lg bg-surface p-3 text-sm"><strong>{day.day}</strong><span>{day.isClosed ? locale === "ar" ? "مغلق" : "Closed" : day.slots.map((slot) => `${slot.open}–${slot.close}`).join("، ")}</span></li>)}</ul> : <p className="text-muted">{locale === "ar" ? "لم تُضبط الساعات." : "Hours are not configured."}</p>}</div></div> : <Alert tone="error">{locale === "ar" ? "بيانات التواصل غير متاحة من إعدادات المتجر." : "Contact data is unavailable from store configuration."}</Alert>}</Shell>;
  if (slug === "shipping") return <Shell title={title}>{fulfillment?.hasOptions ? <div className="grid gap-3 sm:grid-cols-2">{fulfillment.pickup.map((method) => <MethodCard key={method.id} title={method.displayName} description={method.description} />)}{fulfillment.deliveryZones.flatMap((zone) => zone.methods.map((method) => <MethodCard key={method.id} title={method.displayName} description={[zone.name, method.description].filter(Boolean).join(" — ")} />))}</div> : <Alert>{locale === "ar" ? "لا توجد خيارات شحن أو استلام منشورة حاليًا." : "No fulfillment options are currently published."}</Alert>}</Shell>;
  if (slug === "payment") return <Shell title={title}>{paymentMethods.length ? <div className="grid gap-3 sm:grid-cols-2">{paymentMethods.map((method) => <MethodCard key={method.id} title={localizedField({ ar: method.nameAr, en: method.nameEn, generic: method.name }, locale)} description={localizedField({ ar: method.descriptionAr, en: method.descriptionEn, generic: method.description }, locale)} />)}</div> : <Alert>{locale === "ar" ? "لا توجد طرق دفع منشورة حاليًا." : "No payment methods are currently published."}</Alert>}</Shell>;
  if (slug === "returns") {
    return (
      <Shell title={title}>
        {locale === "ar" ? (
          <div className="prose prose-brand max-w-3xl leading-loose text-muted dark:prose-invert">
            <p className="mb-4">شكرا لاختياركم متجر النجوم تيليكوم لشراء منتجاتكم الرهيبة المفضلة ويسعدنا أن نقوم بخدمتكم.</p>
            <p className="mb-4">نحن في متجر النجوم تيليكوم سنبذل ما في وسعنا لتتم عملية الاسترجاع أو الاستبدال بمنتهى البساطة والسلاسة بقدر الإمكان.</p>
            <p className="mb-8">لقد قمنا بتسهيل عملية الاسترجاع أو الاستبدال من خلال الإجراءات التالية:</p>

            <h2 className="mb-4 text-xl font-bold text-foreground">سياسة الفترة الزمنية لاسترجاع أو استبدال المشتريات:</h2>
            <ol className="mb-8 list-decimal space-y-3 ps-5">
              <li>عند الرغبة في استبدال أو استرجاع المنتج عليك الاتصال بنا أولاً.</li>
              <li>يحق للعميل استرجاع المنتج خلال 3 أيام من تاريخ الاستلام، بشرط أن يكون المنتج سليما لم يطرأ عليه أي تغيير، ويتحمل العميل تكاليف الشحن كاملا، ويتم إرجاع تكلفة المنتج للعميل خلال 14 يوم عمل.</li>
              <li>يحق للعميل استبدال المنتج بمنتج آخر، وذلك قبل إرسال الشحنة. وبعد إرسال الشحنة يحق له الاستبدال خلال 14 أيام عمل، وعليه تحمل تكلفة الشحن كاملا وفرق تكلفة المنتج إن وجد.</li>
              <li>إذا كان المنتج معيبا، أو غير مطابق للمواصفات التي تم تحديدها وقت الشراء يحق للعميل استبدال المنتج أو استرجاعه خلال 14 يوما، وعلى العميل في هذه الحالة إرسال ما يثبت تكاليف الشحن موضح فيه: رقم الارسالية – الشحن – والتكلفة. فيحق للعميل عندئذ استرجاع المبلغ كاملا.</li>
              <li>المنتجات الشاملة في الخصومات والعروض لا تستبدل ولا تسترجع، ويستثنى من ذلك وجود عيب في المنتج.</li>
            </ol>

            <h2 className="mb-4 text-xl font-bold text-foreground">لا يقبل استرجاع المنتجات أو استبدالها في الحالات التالية:</h2>
            <ul className="mb-4 list-disc space-y-3 ps-5">
              <li>لا يقبل الاسترجاع بعد مضي 3 أيام من تاريخ الاستلام، ولا يقبل الاستبدال بعد 14 يوما.</li>
              <li>عند تغير المنتج عن حالته الأصلية لأي سبب من الأسباب.</li>
              <li>عند الاستعمال وفتح المنتج.</li>
              <li>المنتجات التي تم تصنيعها بطلب من العميل وفقاً لمواصفات حددها.</li>
            </ul>
          </div>
        ) : (
          <Alert>English translation for returns policy has not been supplied yet.</Alert>
        )}
      </Shell>
    );
  }
  if (slug === "privacy") {
    return (
      <Shell title={title}>
        {locale === "ar" ? (
          <div className="prose prose-brand max-w-3xl leading-loose text-muted dark:prose-invert">
            <h2 className="mb-4 text-xl font-bold text-foreground">الشروط:</h2>
            <p className="mb-4">بدخولك إلى الموقع فأنت توافق على الإلتزام بهذه الشروط، وعلى جميع القوانين واللوائح المعمول بها، وتقر كذلك بأنك مسئول عن الإمتثال لأي قوانين محلية سارية.</p>
            <p className="mb-8">إذا كنت لا توافق على أي من هذه الشروط، فلا يحق لك استخدام أو الدخول إلى هذا الموقع. جميع المواد الواردة في هذا الموقع محمية بموجب حقوق النشر المعمول بها وبموجب قانون حماية العلامات التجارية.</p>

            <h2 className="mb-4 text-xl font-bold text-foreground">القانون المنظم:</h2>
            <p className="mb-8">تخضع هذه الشروط والأحكام ويؤول تفسيرها إلى قوانين المملكة العربية السعودية وتخضع أنت كذلك وبشكل غير قابل للنقض للإختصاص القضائي لمحاكم المملكة العربية السعودية.</p>

            <h2 className="mb-4 text-xl font-bold text-foreground">سياسة الخصوصية:</h2>
            <p className="mb-4">تعتبر الخصوصية والأمن أقصى الأولويات في حيث أننا لم نقم على الإطلاق بمشاركة أو طباعة أو بيع معلومات أي زبون لأي طرف آخر.</p>
            <p className="mb-4">عند قيامك بتقديم المعلومات الشخصية على موقعنا سنعمل بكل جهد على حماية معلوماتك على الإنترنت وخارجه.</p>
            <p className="mb-8">نقوم باستخدام مجموعة متنوعة من تقنيات وإجراءات الأمان للمساعدة على حماية معلوماتك الشخصية من الوصول أو الاستخدام أو الكشف غير المصرح به حالما نقوم بإستلامها. على سبيل المثال، نحن نقوم بتخزين معلوماتك الشخصية على أنظمة كمبيوتر ذات وصول محدود لمصرح لهم بالإطلاع على هذه المعلومات، ويتم تدريب موظفينا على التعامل الآمن مع هذه المعلومات والبيانات وإبقائهم مطلعين على آخر المستجدات التي تتعلق بالإجراءات الأمنية.</p>

            <h2 className="mb-4 text-xl font-bold text-foreground">خصوصية حسابك:</h2>
            <p className="mb-4">أنت مسؤول عن الحفاظ على سرية بيانات حسابك وكلمة المرور وتحديد من يصل إلى جهاز الكمبيوتر الخاص بك أو التطبيق الخاص بنا، كما أنك توافق على قبول المسؤولية عن جميع الأنشطة التي تتم من خلال حسابك أو كلمة المرور الخاصة بك إذا كان عمرك أقل من 18 سنة، فلا يجوز لك استخدام خدمات إلا بإشراك أحد الوالدين أو ولي الأمر.</p>
            <p className="mb-8">نحتفظ بالحق في رفض تقديم الخدمة، أو إنهاء الحسابات، أو إزالة أو تعديل المحتوى، أو إلغاء الأوامر وفقا للتقدير الخاص.</p>

            <h2 className="mb-4 text-xl font-bold text-foreground">سياسة التوصيل:</h2>
            <p className="mb-4">عندما يتم التوصيل سيطلب منك توقيعك إلكترونياً أو توقيعك على نسخة الفاتورة وهذا التوقيع يكون بمثابة تأكيد أنك إستلمت المنتجات كاملة كما هو مبين في الفاتورة.</p>
            <p className="mb-4">إن لم تكن متواجد في العنوان المحدد سنقوم بتسليم الطلب لأى شخص متواجد بهذا العنوان وتوقيعه على الفاتورة إلكترونياً أوعلى نسخة الفاتوره، وعند توقيع أى شخص من الموجودين فى العنوان على طلب التوصيل يعتبر أن العميل قد استلم الأغراض الموجوده بالفاتورةإذا تم الوصول الى العنوان المحدد من قبلك ولم نستطيع تسليم الطلب يرجى الإتصال بخدمة العملاء لتحديد موعد آخر لتوصيل الطلب. الشركة غير مسؤولة عن أيه طلب لم يتم توصيله خلال 30 يوم من تاريخ الطلب.</p>
            <p className="mb-8">يجب التنويه على ضرورة الردعلى المكالمات الواردة إلى جوالك حتى يتمكن المندوب المسؤول عن التوصيل من التنسيق معك على موعد إيصال الطلب. يرجى العلم بأن أيام العمل الرسمية هي من الأحد إلى الخميس، وأن التوصيل غير متاح في يوم الجمعة وأيام العطل والأعياد الرسمية.</p>

            <h2 className="mb-4 text-xl font-bold text-foreground">للتواصل معنا:</h2>
            <p className="mb-4">الاتصال او الواتساب: <span dir="ltr">0532224310</span></p>
            <p className="mb-4">البريد الالكتروني: <a href="mailto:alnjoomtelecom@gmail.com" className="font-bold text-brand hover:underline">alnjoomtelecom@gmail.com</a></p>
            <p className="mb-4">إذا كان لديك أي أسئلة حول بيان الخصوصية وشروط الخدمة أو الممارسات على موقعنا، فيمكنك التواصل معنا على العنوان التالي:</p>
            <p className="mb-8"><a href="mailto:alnjoomtelecom@gmail.com" className="font-bold text-brand hover:underline">alnjoomtelecom@gmail.com</a></p>
          </div>
        ) : (
          <Alert>English translation for privacy policy has not been supplied yet.</Alert>
        )}
      </Shell>
    );
  }

  return <Shell title={title}><Alert>{locale === "ar" ? "لم يزوّد المشروع بنص قانوني معتمد لهذه الصفحة بعد. لن نعرض محتوى قانونيًا مولّدًا أو قديمًا، والصفحة مستبعدة من الفهرسة حتى الاعتماد." : "Approved legal copy has not been supplied. Generated or stale legal text is not shown, and this page remains excluded from indexing until approval."}</Alert></Shell>;
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) { return <main id="main-content" className="container-shell section-space"><h1 className="mb-7 text-3xl font-black sm:text-4xl">{title}</h1>{children}</main>; }
function Card({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string | null }) { return <div className="surface-card p-5"><Icon className="mb-3 size-6 text-brand" /><strong>{label}</strong><p className="mt-2 leading-7 text-muted">{value || "—"}</p></div>; }
function MethodCard({ title, description }: { title: string; description: string | null }) { return <article className="surface-card p-5"><h2 className="font-bold">{title}</h2>{description ? <p className="mt-2 text-sm leading-7 text-muted">{description}</p> : null}</article>; }
const titles: Record<InfoSlug, Record<Locale, string>> = { about: { ar: "عن النجوم تيليكوم", en: "About Alnjoom Telecom" }, contact: { ar: "تواصل معنا", en: "Contact us" }, privacy: { ar: "سياسة الخصوصية", en: "Privacy policy" }, terms: { ar: "الشروط والأحكام", en: "Terms and conditions" }, returns: { ar: "الاستبدال والاسترجاع", en: "Returns" }, shipping: { ar: "خيارات الشحن والاستلام", en: "Shipping and pickup" }, payment: { ar: "طرق الدفع", en: "Payment methods" } };
