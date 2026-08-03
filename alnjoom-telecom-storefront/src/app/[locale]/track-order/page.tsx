import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { isLocale, localePath } from "@/lib/i18n/locales";
import { getStoreConfigSafe } from "@/lib/api/storefront";
import { localizedAlternates } from "@/lib/seo/metadata";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const alternates = isLocale(locale) ? localizedAlternates(await getStoreConfigSafe(), locale, "/track-order") : undefined;
  return { title: locale === "ar" ? "تتبع الطلب" : "Track Order", robots: { index: false, follow: true }, alternates };
}
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <main id="main-content" className="container-shell section-space"><div className="mx-auto max-w-lg surface-card p-6 sm:p-8"><Search className="mb-4 size-9 text-brand" /><h1 className="text-3xl font-black">{locale === "ar" ? "تتبع طلبك" : "Track your order"}</h1><p className="mt-3 text-sm leading-7 text-muted">{locale === "ar" ? "أدخل رمز الطلب ورقم الهاتف المستخدم عند الشراء." : "Enter the order code and phone used at checkout."}</p><form className="mt-6 space-y-4" action={localePath(locale, "/track-order/lookup")}><label className="block text-sm font-bold">{locale === "ar" ? "رمز الطلب" : "Order code"}<input className="field mt-1" name="orderCode" maxLength={100} required /></label><label className="block text-sm font-bold">{locale === "ar" ? "رقم الهاتف" : "Phone"}<input className="field mt-1" name="phone" maxLength={30} required /></label><button className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-brand px-4 font-bold text-white">{locale === "ar" ? "عرض حالة الطلب" : "View order status"}</button></form></div></main>; }
