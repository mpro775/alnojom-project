import Link from "next/link";
import { Clock3, MapPin, Phone } from "lucide-react";
import type { Category, Locale, StoreConfig } from "@/lib/api/contracts";
import { localizedField } from "@/lib/i18n/fields";
import { localePath } from "@/lib/i18n/locales";
import { safeExternalUrl } from "@/lib/images/media";

export function StoreFooter({ locale, config, categories }: { locale: Locale; config: StoreConfig | null; categories: Category[] }) {
  const settings = config?.storeSettings;
  const roots = categories.filter((category) => !category.parentId).slice(0, 6);
  const social = settings ? Object.entries(settings.socialLinks).flatMap(([name, value]) => { const url = safeExternalUrl(value); return url ? [{ name, url }] : []; }) : [];
  return (
    <footer className="mt-auto border-t border-line bg-brand-strong text-white">
      <div className="container-shell grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div><h2 className="text-lg font-bold">{settings ? localizedField({ ar: settings.nameAr, en: settings.nameEn, generic: settings.name }, locale) : locale === "ar" ? "النجوم تيليكوم" : "Alnjoom Telecom"}</h2><p className="mt-3 text-sm leading-7 text-white/70">{settings ? localizedField({ ar: settings.descriptionAr, en: settings.descriptionEn, generic: settings.description }, locale) : locale === "ar" ? "إعدادات المتجر غير متاحة حاليًا." : "Store configuration is currently unavailable."}</p></div>
        <div><h2 className="mb-3 font-bold">{locale === "ar" ? "تسوّق" : "Shop"}</h2><ul className="space-y-2 text-sm text-white/75"><li><Link href={localePath(locale, "/products")}>{locale === "ar" ? "كل المنتجات" : "All products"}</Link></li>{roots.map((category) => <li key={category.id}><Link href={localePath(locale, `/category/${category.slug}`)}>{localizedField({ ar: category.nameAr, en: category.nameEn, generic: category.name }, locale)}</Link></li>)}</ul></div>
        <div><h2 className="mb-3 font-bold">{locale === "ar" ? "خدمة العملاء" : "Customer service"}</h2><ul className="space-y-2 text-sm text-white/75"><li><Link href={localePath(locale, "/track-order")}>{locale === "ar" ? "تتبع الطلب" : "Track order"}</Link></li><li><Link href={localePath(locale, "/shipping")}>{locale === "ar" ? "الشحن" : "Shipping"}</Link></li><li><Link href={localePath(locale, "/payment")}>{locale === "ar" ? "الدفع" : "Payment"}</Link></li><li><Link href={localePath(locale, "/returns")}>{locale === "ar" ? "الاستبدال والاسترجاع" : "Returns"}</Link></li><li><Link href={localePath(locale, "/privacy")}>{locale === "ar" ? "الخصوصية" : "Privacy"}</Link></li><li><Link href={localePath(locale, "/terms")}>{locale === "ar" ? "الشروط" : "Terms"}</Link></li></ul></div>
        <div><h2 className="mb-3 font-bold">{locale === "ar" ? "تواصل معنا" : "Contact"}</h2><ul className="space-y-3 text-sm text-white/75">{settings?.phone ? <li className="flex gap-2"><Phone className="mt-1 size-4 shrink-0" /><a dir="ltr" href={`tel:${settings.phone}`}>{settings.phone}</a></li> : null}{settings?.address ? <li className="flex gap-2"><MapPin className="mt-1 size-4 shrink-0" /><span>{settings.address}</span></li> : null}{settings?.workingHours.length ? <li className="flex gap-2"><Clock3 className="mt-1 size-4 shrink-0" /><span>{locale === "ar" ? "مواعيد العمل متاحة في صفحة التواصل" : "Working hours are available on Contact"}</span></li> : null}</ul>{social.length ? <div className="mt-4 flex flex-wrap gap-2">{social.map((item) => <a key={item.name} className="rounded-lg border border-white/20 px-2 py-1 text-xs" href={item.url} rel="noreferrer" target="_blank">{item.name}</a>)}</div> : null}</div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">© {new Date().getFullYear()} {locale === "ar" ? "النجوم تيليكوم" : "Alnjoom Telecom"}</div>
    </footer>
  );
}
