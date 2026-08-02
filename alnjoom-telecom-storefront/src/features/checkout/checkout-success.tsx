"use client";

import { useEffect, useState } from "react";
import { CircleCheckBig } from "lucide-react";
import type { CheckoutResult, Locale } from "@/lib/api/contracts";
import { formatMoney } from "@/lib/format/commerce";
import { localePath } from "@/lib/i18n/locales";
import { ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { readCheckoutResult } from "./checkout-page";

export function CheckoutSuccess({ locale }: { locale: Locale }) {
  const [result, setResult] = useState<CheckoutResult | null>(null);
  useEffect(() => { const timer = window.setTimeout(() => setResult(readCheckoutResult()), 0); return () => window.clearTimeout(timer); }, []);
  if (!result) return <main id="main-content" className="container-shell section-space"><Alert>{locale === "ar" ? "لا تتوفر تفاصيل الطلب في هذه الجلسة. استخدم رمز الطلب للتتبع." : "Order details are not available in this session. Use your order code to track it."}</Alert><ButtonLink className="mt-5" href={localePath(locale, "/track-order")}>{locale === "ar" ? "تتبع طلب" : "Track an order"}</ButtonLink></main>;
  return <main id="main-content" className="container-shell section-space"><div className="mx-auto max-w-2xl surface-card p-7 text-center sm:p-10"><CircleCheckBig className="mx-auto size-14 text-success" /><p className="mt-4 text-sm font-bold text-success">{locale === "ar" ? "تم إنشاء الطلب" : "Order created"}</p><h1 className="mt-2 text-3xl font-black" dir="ltr">{result.orderCode}</h1><p className="mt-3 text-muted">{locale === "ar" ? `حالة الطلب: ${result.status}` : `Order status: ${result.status}`}</p><dl className="mx-auto mt-7 max-w-md space-y-3 rounded-xl bg-surface p-5 text-sm"><Row label={locale === "ar" ? "الشحن" : "Shipping"} value={formatMoney(result.shippingFee, result.currencyCode, locale)} /><Row label={locale === "ar" ? "الخصم" : "Discount"} value={formatMoney(result.discountTotal, result.currencyCode, locale)} /><Row label={locale === "ar" ? "الإجمالي" : "Total"} value={formatMoney(result.total, result.currencyCode, locale)} /><Row label={locale === "ar" ? "النقاط المستخدمة" : "Points redeemed"} value={String(result.pointsRedeemed)} /><Row label={locale === "ar" ? "النقاط المكتسبة" : "Points earned"} value={String(result.pointsEarned)} /></dl><Alert className="mt-6 text-start">{locale === "ar" ? "إنشاء الطلب لا يعني أن الدفع مسدّد؛ اعتمد على الحالة التي يعرضها المتجر والتتبع." : "Order creation does not mean payment is settled; rely on the displayed server status and tracking."}</Alert><div className="mt-7 flex flex-wrap justify-center gap-3"><ButtonLink href={localePath(locale, `/track-order/${encodeURIComponent(result.orderCode)}`)}>{locale === "ar" ? "تتبع الطلب" : "Track order"}</ButtonLink><ButtonLink variant="secondary" href={localePath(locale, "/products")}>{locale === "ar" ? "متابعة التسوق" : "Continue shopping"}</ButtonLink><ButtonLink variant="ghost" href={localePath(locale, "/account/orders")}>{locale === "ar" ? "طلباتي" : "My orders"}</ButtonLink></div></div></main>;
}
function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-3"><dt className="text-muted">{label}</dt><dd dir="ltr" className="font-bold">{value}</dd></div>; }
