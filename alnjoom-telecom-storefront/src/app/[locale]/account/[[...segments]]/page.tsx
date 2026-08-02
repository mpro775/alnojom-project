import { notFound } from "next/navigation";
import { AccountPage } from "@/features/account/account-page";
import { isLocale } from "@/lib/i18n/locales";

const valid = new Set(["profile", "addresses", "orders", "wishlist", "reviews", "loyalty", "notifications", "support"]);

export default async function Page({ params }: { params: Promise<{ locale: string; segments?: string[] }> }) {
  const { locale, segments = [] } = await params;
  if (!isLocale(locale) || (segments[0] && !valid.has(segments[0])) || (segments.length > 2) || (segments[0] !== "support" && segments.length > 1)) notFound();
  return <AccountPage locale={locale} segments={segments} />;
}
