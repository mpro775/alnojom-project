import type { Locale } from "@/lib/api/contracts";
import { formatMoney } from "@/lib/format/commerce";

export function Price({ amount, currency, locale, from = false, className = "" }: { amount: number | null; currency: string; locale: Locale; from?: boolean; className?: string }) {
  if (amount === null) return <span className={`text-muted ${className}`}>{locale === "ar" ? "السعر عند الاختيار" : "Select for price"}</span>;
  return (
    <span className={className} dir="ltr">
      {from ? <span className="me-1 text-xs font-normal text-muted">{locale === "ar" ? "يبدأ من" : "From"}</span> : null}
      <bdi>{formatMoney(amount, currency, locale)}</bdi>
    </span>
  );
}
