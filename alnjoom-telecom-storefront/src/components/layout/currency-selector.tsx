"use client";

import { useRouter } from "next/navigation";
import type { StoreCurrency } from "@/lib/api/contracts";

export function CurrencySelector({ currencies, selected, label }: { currencies: StoreCurrency[]; selected: string; label: string }) {
  const router = useRouter();
  const enabled = currencies.filter((currency) => currency.isActive);
  if (enabled.length <= 1) return null;
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select className="rounded-md border border-white/25 bg-brand-strong px-2 py-1 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-white" value={selected} onChange={(event) => { document.cookie = `alnjoom.currency=${encodeURIComponent(event.target.value)}; Path=/; Max-Age=31536000; SameSite=Lax`; router.refresh(); }}>
        {enabled.map((currency) => <option key={currency.currencyCode} value={currency.currencyCode}>{currency.currencyCode}</option>)}
      </select>
    </label>
  );
}
