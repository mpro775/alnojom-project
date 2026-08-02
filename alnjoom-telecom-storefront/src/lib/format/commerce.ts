import type { Locale } from "@/lib/api/contracts";

export function formatMoney(amount: number, currencyCode: string, locale: Locale): string {
  try {
    return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-SA", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${new Intl.NumberFormat(locale === "ar" ? "ar" : "en", { maximumFractionDigits: 2 }).format(amount)} ${currencyCode}`;
  }
}

export function validDiscountPercent(price: number, compareAtPrice: number | null): number | null {
  if (compareAtPrice === null || compareAtPrice <= price || compareAtPrice <= 0) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function formatDate(value: string, locale: Locale): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-SA", { dateStyle: "medium" }).format(date);
}
