import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { RecoverCartPage } from "@/features/cart/recover-cart-page";
import { isLocale } from "@/lib/i18n/locales";

export const metadata: Metadata = {
  title: "Cart Recovery",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <Suspense fallback={<main id="main-content" className="container-shell section-space"><div className="skeleton h-[20rem] rounded-xl" /></main>}>
      <RecoverCartPage locale={locale} />
    </Suspense>
  );
}
