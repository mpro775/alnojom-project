import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CartPage } from "@/features/cart/cart-page";
import { isLocale } from "@/lib/i18n/locales";
import { getStoreConfigSafe } from "@/lib/api/storefront";
import { localizedAlternates } from "@/lib/seo/metadata";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const alternates = isLocale(locale) ? localizedAlternates(await getStoreConfigSafe(), locale, "/cart") : undefined;
  return { title: locale === "ar" ? "السلة" : "Cart", robots: { index: false, follow: false }, alternates };
}
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <CartPage locale={locale} />; }
