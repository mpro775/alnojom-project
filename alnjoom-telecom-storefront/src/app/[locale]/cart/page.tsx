import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CartPage } from "@/features/cart/cart-page";
import { isLocale } from "@/lib/i18n/locales";
export const metadata: Metadata = { title: "السلة", robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <CartPage locale={locale} />; }
