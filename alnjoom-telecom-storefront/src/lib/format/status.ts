import type { Locale } from "@/lib/api/contracts";

const labels: Record<string, { ar: string; en: string }> = {
  pending: { ar: "قيد الانتظار", en: "Pending" },
  confirmed: { ar: "مؤكد", en: "Confirmed" },
  processing: { ar: "قيد التجهيز", en: "Processing" },
  shipped: { ar: "تم الشحن", en: "Shipped" },
  delivered: { ar: "تم التسليم", en: "Delivered" },
  completed: { ar: "مكتمل", en: "Completed" },
  cancelled: { ar: "ملغي", en: "Cancelled" },
  refunded: { ar: "مسترد", en: "Refunded" },
};

export function statusLabel(status: string, locale: Locale): string {
  return labels[status.toLowerCase()]?.[locale] ?? status;
}
