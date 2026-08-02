import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookies";
import { isLocale, localePath } from "@/lib/i18n/locales";

export const metadata: Metadata = { title: "الحساب", robots: { index: false, follow: false } };

export default async function AccountLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "ar";
  const store = await cookies();
  if (!store.has(ACCESS_COOKIE) && !store.has(REFRESH_COOKIE)) {
    redirect(`${localePath(locale, "/login")}?returnTo=${encodeURIComponent(localePath(locale, "/account"))}`);
  }
  return children;
}
