import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { InfoPage, type InfoSlug } from "@/features/static/info-page";
import { getCheckoutBootstrapSafe, getStoreConfigSafe } from "@/lib/api/storefront";
import { isLocale } from "@/lib/i18n/locales";
const info = new Set<InfoSlug>(["about", "contact", "privacy", "terms", "returns", "shipping", "payment"]);
export async function generateMetadata({ params }: { params: Promise<{ locale: string; info: string }> }): Promise<Metadata> { const { info: slug } = await params; return { title: slug, robots: { index: slug === "about" || slug === "contact" || slug === "shipping" || slug === "payment", follow: true } }; }
export default async function Page({ params }: { params: Promise<{ locale: string; info: string }> }) { const { locale, info: slug } = await params; if (!isLocale(locale) || !info.has(slug as InfoSlug)) notFound(); const [config, bootstrap] = await Promise.all([getStoreConfigSafe(), getCheckoutBootstrapSafe()]); return <InfoPage slug={slug as InfoSlug} locale={locale} config={config} fulfillment={bootstrap.fulfillment} paymentMethods={bootstrap.paymentMethods} />; }
