import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckoutPage } from "@/features/checkout/checkout-page";
import { getCheckoutBootstrapSafe, getStoreConfigSafe } from "@/lib/api/storefront";
import { isLocale } from "@/lib/i18n/locales";
import { localizedAlternates } from "@/lib/seo/metadata";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const alternates = isLocale(locale) ? localizedAlternates(await getStoreConfigSafe(), locale, "/checkout") : undefined;
  return { title: locale === "ar" ? "الدفع" : "Checkout", robots: { index: false, follow: false }, alternates };
}
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); const [config, bootstrap] = await Promise.all([getStoreConfigSafe(), getCheckoutBootstrapSafe()]); return <CheckoutPage locale={locale} config={config} fulfillment={bootstrap.fulfillment} paymentMethods={bootstrap.paymentMethods} />; }
