import type { Locale } from "@/lib/api/contracts";

export const locales = ["ar", "en"] as const;

export function isLocale(value: string): value is Locale {
  return value === "ar" || value === "en";
}

export function localePath(locale: Locale, path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === "ar") return normalized;
  return normalized === "/" ? "/en" : `/en${normalized}`;
}

export function switchLocalePath(pathname: string, locale: Locale): string {
  const withoutLocale = pathname === "/en" ? "/" : pathname.replace(/^\/en(?=\/)/, "");
  return localePath(locale, withoutLocale);
}

export function safeReturnTo(value: string | null | undefined, locale: Locale): string {
  const fallback = localePath(locale, "/account");
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\r\n]/.test(value)) {
    return fallback;
  }
  try {
    const parsed = new URL(value, "https://storefront.invalid");
    return parsed.origin === "https://storefront.invalid" ? `${parsed.pathname}${parsed.search}${parsed.hash}` : fallback;
  } catch {
    return fallback;
  }
}
