import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckoutPage } from "@/features/checkout/checkout-page";
import { getCheckoutBootstrapSafe, getStoreConfigSafe } from "@/lib/api/storefront";
import { isLocale } from "@/lib/i18n/locales";
export const metadata: Metadata = { title: "الدفع", robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); const [config, bootstrap] = await Promise.all([getStoreConfigSafe(), getCheckoutBootstrapSafe()]); return <CheckoutPage locale={locale} config={config} fulfillment={bootstrap.fulfillment} paymentMethods={bootstrap.paymentMethods} />; }
