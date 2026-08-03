import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { OrderTrackingView } from "@/features/orders/order-tracking";
import { getOrderTracking } from "@/lib/api/storefront";
import { isLocale } from "@/lib/i18n/locales";
import { Alert } from "@/components/ui/alert";
import { getStoreConfigSafe } from "@/lib/api/storefront";
import { localizedAlternates } from "@/lib/seo/metadata";
export async function generateMetadata({ params }: { params: Promise<{ locale: string; orderCode: string }> }): Promise<Metadata> {
  const { locale, orderCode } = await params;
  const alternates = isLocale(locale) ? localizedAlternates(await getStoreConfigSafe(), locale, `/track-order/${orderCode}`) : undefined;
  return { title: locale === "ar" ? "تتبع الطلب" : "Track Order", robots: { index: false, follow: false }, alternates };
}
export default async function Page({ params, searchParams }: { params: Promise<{ locale: string; orderCode: string }>; searchParams: Promise<{ phone?: string }> }) { const [{ locale, orderCode }, query] = await Promise.all([params, searchParams]); if (!isLocale(locale)) notFound(); const tracking = await getOrderTracking(orderCode, query.phone?.trim()).catch(() => null); return tracking ? <OrderTrackingView locale={locale} tracking={tracking} /> : <main id="main-content" className="container-shell section-space"><Alert tone="error">{locale === "ar" ? "تعذّر العثور على الطلب بهذه البيانات." : "No order could be found with these details."}</Alert></main>; }
