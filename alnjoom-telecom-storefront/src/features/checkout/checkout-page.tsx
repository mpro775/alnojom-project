"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, MapPin, UploadCloud } from "lucide-react";
import type { Address, CheckoutInput, CheckoutQuote, CheckoutResult, Customer, FulfillmentOptions, Locale, LoyaltyWallet, PaymentMethod, StoreConfig } from "@/lib/api/contracts";
import { apiClient } from "@/lib/api/client";
import { ApiError, userSafeError } from "@/lib/api/error";
import { customerEndpoints, publicEndpoints, toCustomerBff, toStorefrontBff } from "@/lib/api/endpoints";
import { localizedField } from "@/lib/i18n/fields";
import { localePath } from "@/lib/i18n/locales";
import { formatMoney } from "@/lib/format/commerce";
import { safeExternalUrl } from "@/lib/images/media";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useCart } from "@/features/cart/cart-context";
import { clearCheckoutKey, getCheckoutKey } from "./idempotency";
import { uploadPaymentReceipt } from "./receipt-upload";

const SUCCESS_KEY = "alnjoom.checkout.result";

export function CheckoutPage({ locale, config, fulfillment, paymentMethods }: { locale: Locale; config: StoreConfig | null; fulfillment: FulfillmentOptions | null; paymentMethods: PaymentMethod[] }) {
  const { cart, loading: cartLoading } = useCart();
  const router = useRouter();
  const { show } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wallet, setWallet] = useState<LoyaltyWallet | null>(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedFulfillment, setSelectedFulfillment] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [points, setPoints] = useState(0);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [receiptProgress, setReceiptProgress] = useState<number | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const currency = cart?.currencyCode ?? config?.storeSettings.currencyCode ?? "";
  const allowGuest = config?.storeSettings.orderSettings.allowGuestCheckout ?? false;
  const selectedMethod = paymentMethods.find((method) => method.id === selectedPayment) ?? null;
  const fulfillmentSelection = useMemo(() => parseFulfillment(selectedFulfillment), [selectedFulfillment]);

  useEffect(() => {
    apiClient<Customer>("/api/auth/session").then((profile) => {
      setCustomer(profile);
      return Promise.all([
        apiClient<Address[]>(toCustomerBff(customerEndpoints.addresses)),
        apiClient<LoyaltyWallet>(toCustomerBff(customerEndpoints.loyaltyWallet)).catch(() => null),
      ]);
    }).then(([nextAddresses, nextWallet]) => {
      setAddresses(nextAddresses);
      setSelectedAddress(nextAddresses.find((item) => item.isDefault)?.id ?? "");
      setWallet(nextWallet);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!cart || !fulfillmentSelection.methodId) return;
    const controller = new AbortController();
    const resetTimer = window.setTimeout(() => setQuote(null), 0);
    const timer = window.setTimeout(() => {
      setQuoteError(null);
      apiClient<CheckoutQuote>(toStorefrontBff(publicEndpoints.checkoutQuote), {
        method: "POST",
        signal: controller.signal,
        body: JSON.stringify({ cartId: cart.cartId, currencyCode: currency, fulfillmentZoneId: fulfillmentSelection.zoneId, fulfillmentMethodId: fulfillmentSelection.methodId, ...(couponCode ? { couponCode } : {}), ...(points > 0 ? { pointsToRedeem: points } : {}) }),
      }).then(setQuote).catch((error) => { if ((error as Error).name !== "AbortError") { setQuote(null); setQuoteError(userSafeError(error, locale)); } });
    }, 350);
    return () => { window.clearTimeout(resetTimer); window.clearTimeout(timer); controller.abort(); };
  }, [cart, couponCode, currency, fulfillmentSelection, locale, points]);

  if (cartLoading) return <main id="main-content" className="container-shell section-space"><div className="skeleton h-[32rem] rounded-xl" /></main>;
  if (!cart?.items.length) return <main id="main-content" className="container-shell section-space"><Alert tone="error">{locale === "ar" ? "لا يمكن بدء الدفع بسلة فارغة." : "Checkout cannot start with an empty cart."}</Alert><ButtonLink className="mt-5" href={localePath(locale, "/cart")}>{locale === "ar" ? "العودة للسلة" : "Back to cart"}</ButtonLink></main>;
  if (!fulfillment?.hasOptions || !fulfillmentOptions(fulfillment).length) return <main id="main-content" className="container-shell section-space"><Alert tone="error">{locale === "ar" ? "لا توجد طرق استلام أو توصيل متاحة حاليًا. تواصل مع المتجر." : "No pickup or delivery methods are currently available. Contact the store."}</Alert></main>;
  if (!paymentMethods.length) return <main id="main-content" className="container-shell section-space"><Alert tone="error">{locale === "ar" ? "لا توجد طرق دفع مفعلة حاليًا." : "No payment methods are currently enabled."}</Alert></main>;

  async function upload(file: File) {
    setReceiptError(null); setReceiptProgress(0); setReceiptId(null);
    try { const asset = await uploadPaymentReceipt(file, setReceiptProgress); setReceiptId(asset.id); setReceiptProgress(100); show(locale === "ar" ? "تم رفع الإيصال" : "Receipt uploaded", "success"); }
    catch (error) { setReceiptProgress(null); setReceiptError(userSafeError(error, locale)); }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cart) return;
    const activeCart = cart;
    if (!quote || !selectedMethod || !fulfillmentSelection.methodId) { setQuoteError(locale === "ar" ? "أكمل خيارات الشحن للحصول على تسعير نهائي." : "Complete fulfillment choices to obtain a final quote."); return; }
    if (!customer && !allowGuest) { router.push(`${localePath(locale, "/login")}?returnTo=${encodeURIComponent(localePath(locale, "/checkout"))}`); return; }
    if (selectedMethod.requiresReceipt && !selectedMethod.isReceiptOptional && !receiptId) { setReceiptError(locale === "ar" ? "الإيصال مطلوب لطريقة الدفع." : "A receipt is required for this payment method."); return; }
    const form = new FormData(event.currentTarget);
    const address = addresses.find((item) => item.id === selectedAddress);
    const input = compact({
      cartId: activeCart.cartId,
      currencyCode: currency,
      customerName: customer?.fullName ?? String(form.get("customerName") ?? "").trim(),
      customerPhone: customer?.phone ?? String(form.get("customerPhone") ?? "").trim(),
      customerEmail: customer?.email ?? String(form.get("customerEmail") ?? "").trim(),
      customerAddressId: address?.id,
      addressLine: address ? undefined : String(form.get("addressLine") ?? "").trim(),
      city: address ? undefined : String(form.get("city") ?? "").trim(),
      area: address ? undefined : String(form.get("area") ?? "").trim(),
      fulfillmentZoneId: fulfillmentSelection.zoneId,
      fulfillmentMethodId: fulfillmentSelection.methodId,
      couponCode: couponCode || undefined,
      note: String(form.get("note") ?? "").trim(),
      storePaymentMethodId: selectedMethod.id,
      payerReference: String(form.get("payerReference") ?? "").trim(),
      payerReceiptMediaAssetId: receiptId ?? undefined,
      payerNote: String(form.get("payerNote") ?? "").trim(),
      pointsToRedeem: points > 0 ? points : undefined,
    }) as CheckoutInput;
    const key = getCheckoutKey(input, window.sessionStorage);
    setBusy(true); setQuoteError(null);
    try {
      const result = await apiClient<CheckoutResult>(toStorefrontBff(publicEndpoints.checkout), { method: "POST", headers: { "Idempotency-Key": key }, body: JSON.stringify(input) });
      window.sessionStorage.setItem(SUCCESS_KEY, JSON.stringify(result));
      clearCheckoutKey(window.sessionStorage);
      router.replace(localePath(locale, "/order/success"));
    } catch (error) {
      setQuoteError(userSafeError(error, locale));
    } finally { setBusy(false); }
  }

  return (
    <main id="main-content" className="container-shell section-space">
      <h1 className="mb-8 text-3xl font-black sm:text-4xl">{locale === "ar" ? "إتمام الطلب" : "Checkout"}</h1>
      {!customer && !allowGuest ? <Alert className="mb-5">{locale === "ar" ? "يتطلب إعداد المتجر تسجيل الدخول قبل إتمام الطلب." : "Store settings require sign-in before checkout."}<ButtonLink className="mt-3" href={`${localePath(locale, "/login")}?returnTo=${encodeURIComponent(localePath(locale, "/checkout"))}`}>{locale === "ar" ? "تسجيل الدخول" : "Sign in"}</ButtonLink></Alert> : null}
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_23rem]">
        <div className="space-y-5">
          <Section icon={MapPin} title={locale === "ar" ? "بيانات التواصل والعنوان" : "Contact and address"}>
            {!customer ? <div className="grid gap-3 sm:grid-cols-2"><Field label={locale === "ar" ? "الاسم" : "Name"} name="customerName" maxLength={120} /><Field label={locale === "ar" ? "الهاتف" : "Phone"} name="customerPhone" maxLength={30} /><Field label={locale === "ar" ? "البريد (اختياري)" : "Email (optional)"} name="customerEmail" type="email" maxLength={120} required={false} /></div> : <p className="text-sm text-muted">{customer.fullName} — <bdi>{customer.phone}</bdi></p>}
            {addresses.length ? <div className="mt-4"><label className="text-sm font-bold">{locale === "ar" ? "عنوان محفوظ" : "Saved address"}<select className="field mt-1" value={selectedAddress} onChange={(event) => setSelectedAddress(event.target.value)}><option value="">{locale === "ar" ? "استخدام عنوان جديد" : "Use a new address"}</option>{addresses.map((address) => <option key={address.id} value={address.id}>{address.addressLine}</option>)}</select></label></div> : null}
            {!selectedAddress ? <div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label={locale === "ar" ? "العنوان" : "Address"} name="addressLine" maxLength={250} /><Field label={locale === "ar" ? "المدينة" : "City"} name="city" maxLength={120} /><Field label={locale === "ar" ? "المنطقة" : "Area"} name="area" maxLength={120} required={false} /></div> : null}
          </Section>
          <Section icon={MapPin} title={locale === "ar" ? "الاستلام أو التوصيل" : "Pickup or delivery"}><div className="grid gap-3">{fulfillmentOptions(fulfillment).map((option) => <label key={option.key} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${selectedFulfillment === option.key ? "border-brand bg-surface" : "border-line"}`}><input type="radio" name="fulfillment" value={option.key} checked={selectedFulfillment === option.key} onChange={() => setSelectedFulfillment(option.key)} required /><span><strong>{option.method.displayName}</strong><span className="mt-1 block text-sm text-muted">{option.zoneName}{option.method.description ? ` — ${option.method.description}` : ""}</span><span className="mt-2 block text-sm font-bold text-brand" dir="ltr">{formatMoney(option.method.cost, currency, locale)}</span></span></label>)}</div></Section>
          <Section icon={CreditCard} title={locale === "ar" ? "طريقة الدفع" : "Payment method"}><div className="grid gap-3 sm:grid-cols-2">{paymentMethods.map((method) => <label key={method.id} className={`cursor-pointer rounded-xl border p-4 ${selectedPayment === method.id ? "border-brand bg-surface" : "border-line"}`}><span className="flex items-center gap-2"><input type="radio" name="payment" value={method.id} checked={selectedPayment === method.id} onChange={() => { setSelectedPayment(method.id); setReceiptId(null); setReceiptProgress(null); }} required /><strong>{localizedField({ ar: method.nameAr, en: method.nameEn, generic: method.name }, locale)}</strong></span><span className="mt-2 block text-sm leading-6 text-muted">{localizedField({ ar: method.descriptionAr, en: method.descriptionEn, generic: method.description }, locale)}</span></label>)}</div>{selectedMethod ? <div className="mt-4 rounded-xl bg-surface p-4 text-sm leading-7">{selectedMethod.accountName ? <p><strong>{locale === "ar" ? "اسم الحساب:" : "Account name:"}</strong> {selectedMethod.accountName}</p> : null}{selectedMethod.accountNumber ? <p><strong>{locale === "ar" ? "رقم الحساب:" : "Account number:"}</strong> <bdi>{selectedMethod.accountNumber}</bdi></p> : null}{selectedMethod.iban ? <p><strong>IBAN:</strong> <bdi>{selectedMethod.iban}</bdi></p> : null}{localizedField({ ar: selectedMethod.instructionsAr, en: selectedMethod.instructionsEn, generic: selectedMethod.instructions }, locale) ? <p className="mt-2">{localizedField({ ar: selectedMethod.instructionsAr, en: selectedMethod.instructionsEn, generic: selectedMethod.instructions }, locale)}</p> : null}{selectedMethod.iconUrl && safeExternalUrl(selectedMethod.iconUrl) ? null : null}</div> : null}{selectedMethod?.requiresReference ? <Field className="mt-4" label={locale === "ar" ? "مرجع العملية" : "Payment reference"} name="payerReference" maxLength={160} /> : null}{selectedMethod?.requiresReceipt || selectedMethod?.isReceiptOptional ? <div className="mt-4"><label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-brand bg-surface p-4 text-center"><UploadCloud className="mb-2 size-7 text-brand" /><span className="text-sm font-bold">{locale === "ar" ? "رفع صورة الإيصال (حتى 5 MB)" : "Upload receipt image (up to 5 MB)"}</span><input className="sr-only" type="file" accept="image/*" required={selectedMethod.requiresReceipt && !selectedMethod.isReceiptOptional && !receiptId} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} /></label>{receiptProgress !== null ? <div className="mt-2 h-2 overflow-hidden rounded-full bg-line"><div className="h-full bg-brand transition-all" style={{ width: `${receiptProgress}%` }} /></div> : null}{receiptId ? <p className="mt-2 flex items-center gap-2 text-sm font-bold text-success"><CheckCircle2 className="size-4" />{locale === "ar" ? "الإيصال جاهز" : "Receipt ready"}</p> : null}{receiptError ? <Alert tone="error" className="mt-2">{receiptError}</Alert> : null}</div> : null}</Section>
          <Section icon={CreditCard} title={locale === "ar" ? "خصم وولاء" : "Coupon and loyalty"}><div className="flex gap-2"><input className="field" value={couponInput} onChange={(event) => setCouponInput(event.target.value)} maxLength={40} placeholder={locale === "ar" ? "رمز القسيمة" : "Coupon code"} /><Button type="button" variant="secondary" onClick={() => setCouponCode(couponInput.trim())}>{locale === "ar" ? "تطبيق" : "Apply"}</Button></div>{customer && wallet ? <label className="mt-4 block text-sm font-bold">{locale === "ar" ? `النقاط المستخدمة (متاح ${wallet.availablePoints})` : `Points to redeem (${wallet.availablePoints} available)`}<input className="field mt-1" type="number" min={0} max={wallet.availablePoints} step={1} value={points} onChange={(event) => setPoints(Math.max(0, Math.min(wallet.availablePoints, Number(event.target.value) || 0)))} /></label> : null}</Section>
          <Section icon={CreditCard} title={locale === "ar" ? "ملاحظات الطلب" : "Order note"}><textarea name="note" className="field min-h-28" maxLength={500} /></Section>
        </div>
        <aside className="surface-card h-fit p-5 lg:sticky lg:top-4"><h2 className="text-lg font-bold">{locale === "ar" ? "ملخص الطلب" : "Order summary"}</h2><dl className="mt-5 space-y-3 text-sm"><Row label={locale === "ar" ? "المجموع الفرعي" : "Subtotal"} value={formatMoney(quote?.subtotal ?? cart.subtotal, currency, locale)} /><Row label={locale === "ar" ? "الشحن" : "Shipping"} value={quote ? formatMoney(quote.shippingFee, currency, locale) : "—"} />{quote?.promotionDiscount ? <Row label={locale === "ar" ? "خصم العروض" : "Promotion discount"} value={`− ${formatMoney(quote.promotionDiscount, currency, locale)}`} /> : null}{quote?.pointsDiscount ? <Row label={locale === "ar" ? "خصم النقاط" : "Points discount"} value={`− ${formatMoney(quote.pointsDiscount, currency, locale)}`} /> : null}</dl><div className="my-5 flex items-center justify-between border-y border-line py-4"><strong>{locale === "ar" ? "الإجمالي" : "Total"}</strong><strong className="text-xl text-brand" dir="ltr">{quote ? formatMoney(quote.total, currency, locale) : "—"}</strong></div>{quote?.potentialEarnPoints ? <p className="mb-4 text-xs text-success">{locale === "ar" ? `قد تكسب ${quote.potentialEarnPoints} نقطة` : `You may earn ${quote.potentialEarnPoints} points`}</p> : null}{quoteError ? <Alert tone="error" className="mb-4">{quoteError}</Alert> : null}<Button className="w-full" disabled={busy || !quote || !selectedPayment}>{busy ? locale === "ar" ? "جارٍ إنشاء الطلب…" : "Creating order…" : locale === "ar" ? "تأكيد وإنشاء الطلب" : "Confirm and create order"}</Button><p className="mt-3 text-xs leading-6 text-muted">{locale === "ar" ? "إنشاء الطلب لا يعني اكتمال تسوية الدفع إلا إذا أكد الخادم ذلك." : "Creating an order does not imply payment settlement unless the server confirms it."}</p></aside>
      </form>
    </main>
  );
}

function fulfillmentOptions(value: FulfillmentOptions) {
  return [
    ...value.pickup.map((method) => ({ key: `${method.zoneId}:${method.id}`, zoneId: method.zoneId, zoneName: "", method })),
    ...value.deliveryZones.flatMap((zone) => zone.methods.map((method) => ({ key: `${zone.id}:${method.id}`, zoneId: zone.id, zoneName: zone.name, method }))),
  ];
}
function parseFulfillment(value: string) { const [zoneId, methodId] = value.split(":"); return { zoneId: zoneId || undefined, methodId: methodId || undefined }; }
function compact<T extends Record<string, unknown>>(value: T): T { return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== "")) as T; }
function Section({ icon: Icon, title, children }: { icon: typeof MapPin; title: string; children: React.ReactNode }) { return <section className="surface-card p-5"><h2 className="mb-5 flex items-center gap-2 text-lg font-bold"><Icon className="size-5 text-brand" />{title}</h2>{children}</section>; }
function Field({ label, className = "", required = true, ...props }: { label: string; className?: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) { return <label className={`block text-sm font-bold ${className}`}>{label}<input className="field mt-1" required={required} {...props} /></label>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-3"><dt className="text-muted">{label}</dt><dd dir="ltr">{value}</dd></div>; }

export function readCheckoutResult(): CheckoutResult | null {
  try { const value = window.sessionStorage.getItem(SUCCESS_KEY); return value ? JSON.parse(value) as CheckoutResult : null; } catch { return null; }
}
