import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookies";
import { isLocale, localePath } from "@/lib/i18n/locales";
import { getStoreConfigSafe } from "@/lib/api/storefront";
import { localizedAlternates } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const alternates = isLocale(locale) ? localizedAlternates(await getStoreConfigSafe(), locale, "/account") : undefined;
  return { title: locale === "ar" ? "الحساب" : "Account", robots: { index: false, follow: false }, alternates };
}

export default async function AccountLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "ar";
  const store = await cookies();
  if (!store.has(ACCESS_COOKIE) && !store.has(REFRESH_COOKIE)) {
    redirect(`${localePath(locale, "/login")}?returnTo=${encodeURIComponent(localePath(locale, "/account"))}`);
  }
  return children;
}
