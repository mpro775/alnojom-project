import type { Locale, OrderTracking } from "@/lib/api/contracts";
import { formatDate, formatMoney } from "@/lib/format/commerce";
import { statusLabel } from "@/lib/format/status";

export function OrderTrackingView({ locale, tracking }: { locale: Locale; tracking: OrderTracking }) {
  return (
    <main id="main-content" className="container-shell section-space">
      <div className="mx-auto max-w-3xl"><p className="text-sm font-bold text-brand">{locale === "ar" ? "تتبع الطلب" : "Order tracking"}</p><h1 className="mt-2 text-3xl font-black" dir="ltr">{tracking.orderCode}</h1><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="surface-card p-5"><span className="text-sm text-muted">{locale === "ar" ? "الحالة الحالية" : "Current status"}</span><strong className="mt-2 block text-xl text-brand">{statusLabel(tracking.status, locale)}</strong></div><div className="surface-card p-5"><span className="text-sm text-muted">{locale === "ar" ? "إجمالي الطلب" : "Order total"}</span><strong className="mt-2 block text-xl text-brand" dir="ltr">{formatMoney(tracking.total, tracking.currencyCode, locale)}</strong></div></div><ol className="mt-8 space-y-0">{tracking.timeline.map((entry, index) => <li key={`${entry.status}-${entry.createdAt}-${index}`} className="relative grid grid-cols-[2rem_1fr] gap-3 pb-7 last:pb-0"><span className="relative z-10 mt-1 grid size-7 place-items-center rounded-full bg-brand text-xs text-white">{index + 1}</span>{index < tracking.timeline.length - 1 ? <span className="absolute start-[.85rem] top-7 h-full w-px bg-line" /> : null}<div className="surface-card p-4"><strong>{statusLabel(entry.status, locale)}</strong>{entry.note ? <p className="mt-2 text-sm text-muted">{entry.note}</p> : null}<time className="mt-2 block text-xs text-muted">{formatDate(entry.createdAt, locale)}</time></div></li>)}</ol></div>
    </main>
  );
}
