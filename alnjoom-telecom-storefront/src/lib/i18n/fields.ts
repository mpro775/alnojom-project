import type { Locale } from "@/lib/api/contracts";

export function localizedField(
  value: { ar?: string | null | undefined; en?: string | null | undefined; generic?: string | null | undefined },
  locale: Locale,
): string {
  const order = locale === "ar" ? [value.ar, value.generic, value.en] : [value.en, value.generic, value.ar];
  return order.find((item): item is string => typeof item === "string" && item.trim().length > 0)?.trim() ?? "";
}
