import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckoutSuccess } from "@/features/checkout/checkout-success";
import { isLocale } from "@/lib/i18n/locales";
export const metadata: Metadata = { title: "نتيجة الطلب", robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <CheckoutSuccess locale={locale} />; }
