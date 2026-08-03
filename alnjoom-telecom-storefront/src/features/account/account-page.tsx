"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CircleUserRound, Heart, LayoutDashboard, LogOut, MapPin, MessageSquare, Package, Pencil, Plus, Star, Trash2, WalletCards } from "lucide-react";
import type { Address, Customer, CustomerOrder, Locale, LoyaltyLedgerEntry, LoyaltyWallet, NotificationItem, PageResult, Review, SupportMessage, SupportTicket, WishlistItem } from "@/lib/api/contracts";
import { apiClient } from "@/lib/api/client";
import { customerEndpoints, toAuthBff, toCustomerBff } from "@/lib/api/endpoints";
import { ApiError, userSafeError } from "@/lib/api/error";
import { formatDate, formatMoney } from "@/lib/format/commerce";
import { localePath } from "@/lib/i18n/locales";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { MediaImage } from "@/components/ui/media-image";
import { useToast } from "@/components/ui/toast";

type Section = "dashboard" | "profile" | "addresses" | "orders" | "wishlist" | "reviews" | "loyalty" | "notifications" | "support";

export function AccountPage({ locale, segments }: { locale: Locale; segments: string[] }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const section = (segments[0] ?? "dashboard") as Section;
  const detail = segments[1];

  useEffect(() => {
    apiClient<Customer>("/api/auth/session")
      .then(setCustomer)
      .catch((reason) => {
        if (reason instanceof ApiError && reason.status === 401) router.replace(`${localePath(locale, "/login")}?returnTo=${encodeURIComponent(localePath(locale, `/account/${segments.join("/")}`))}`);
        else setError(userSafeError(reason, locale));
      })
      .finally(() => setLoading(false));
  }, [locale, router, segments]);

  async function logout() {
    await apiClient(toAuthBff(customerEndpoints.logout), { method: "POST" }).catch(() => undefined);
    router.replace(localePath(locale));
    router.refresh();
  }

  if (loading) return <main id="main-content" className="container-shell section-space"><div className="skeleton h-80 rounded-xl" /></main>;
  if (error) return <main id="main-content" className="container-shell section-space"><Alert tone="error">{error}</Alert></main>;
  if (!customer) return null;

  return (
    <main id="main-content" className="container-shell section-space">
      <div className="grid gap-7 lg:grid-cols-[15rem_1fr]">
        <aside className="surface-card h-fit overflow-hidden"><div className="bg-brand p-5 text-white"><CircleUserRound className="mb-3 size-9" /><strong className="block">{customer.fullName}</strong><span className="text-xs text-white/70" dir="ltr">{customer.phone}</span></div><nav className="p-2" aria-label={locale === "ar" ? "صفحات الحساب" : "Account pages"}><ul>{navItems.map((item) => { const Icon = item.icon; const active = section === item.id; return <li key={item.id}><Link className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold ${active ? "bg-surface text-brand" : "hover:bg-surface"}`} href={localePath(locale, item.id === "dashboard" ? "/account" : `/account/${item.id}`)}><Icon className="size-4" />{item.label[locale]}</Link></li>; })}<li><button className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-bold text-danger hover:bg-red-50" onClick={() => void logout()}><LogOut className="size-4" />{locale === "ar" ? "تسجيل الخروج" : "Sign out"}</button></li></ul></nav></aside>
        <section>
          {section === "dashboard" ? <Dashboard locale={locale} customer={customer} /> : null}
          {section === "profile" ? <Profile locale={locale} customer={customer} onUpdate={setCustomer} /> : null}
          {section === "addresses" ? <Addresses locale={locale} /> : null}
          {section === "orders" ? <Orders locale={locale} /> : null}
          {section === "wishlist" ? <Wishlist locale={locale} /> : null}
          {section === "reviews" ? <Reviews locale={locale} /> : null}
          {section === "loyalty" ? <Loyalty locale={locale} /> : null}
          {section === "notifications" ? <Notifications locale={locale} /> : null}
          {section === "support" ? detail === "new" ? <NewTicket locale={locale} /> : detail ? <TicketDetails locale={locale} ticketId={detail} /> : <Support locale={locale} /> : null}
        </section>
      </div>
    </main>
  );
}

const navItems = [
  { id: "dashboard", icon: LayoutDashboard, label: { ar: "نظرة عامة", en: "Overview" } },
  { id: "profile", icon: CircleUserRound, label: { ar: "الملف الشخصي", en: "Profile" } },
  { id: "addresses", icon: MapPin, label: { ar: "العناوين", en: "Addresses" } },
  { id: "orders", icon: Package, label: { ar: "الطلبات", en: "Orders" } },
  { id: "wishlist", icon: Heart, label: { ar: "المفضلة", en: "Wishlist" } },
  { id: "reviews", icon: Star, label: { ar: "التقييمات", en: "Reviews" } },
  { id: "loyalty", icon: WalletCards, label: { ar: "الولاء", en: "Loyalty" } },
  { id: "notifications", icon: Bell, label: { ar: "الإشعارات", en: "Notifications" } },
  { id: "support", icon: MessageSquare, label: { ar: "الدعم", en: "Support" } },
] as const;

function Dashboard({ locale, customer }: { locale: Locale; customer: Customer }) {
  return <div><h1 className="text-3xl font-black">{locale === "ar" ? `مرحبًا ${customer.fullName}` : `Welcome, ${customer.fullName}`}</h1><p className="mt-3 text-muted">{locale === "ar" ? "أدر عناوينك وطلباتك ومفضّلتك ونقاطك من مكان واحد." : "Manage addresses, orders, wishlist and loyalty in one place."}</p><div className="mt-7 grid gap-3 sm:grid-cols-3">{navItems.slice(2, 5).map((item) => { const Icon = item.icon; return <Link key={item.id} className="surface-card p-5 hover:border-brand" href={localePath(locale, `/account/${item.id}`)}><Icon className="mb-4 size-6 text-brand" /><strong>{item.label[locale]}</strong></Link>; })}</div></div>;
}

function Profile({ locale, customer, onUpdate }: { locale: Locale; customer: Customer; onUpdate: (customer: Customer) => void }) {
  const { show } = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState("");
  return <div><h1 className="text-3xl font-black">{locale === "ar" ? "الملف الشخصي" : "Profile"}</h1><form className="surface-card mt-6 grid gap-4 p-5 sm:grid-cols-2" onSubmit={async (event) => { event.preventDefault(); setBusy(true); const form = new FormData(event.currentTarget); try { const next = await apiClient<Customer>(toCustomerBff(customerEndpoints.me), { method: "PATCH", body: JSON.stringify({ fullName: String(form.get("fullName") ?? "").trim(), phone: String(form.get("phone") ?? "").trim(), email: String(form.get("email") ?? "").trim() }) }); onUpdate(next); show(locale === "ar" ? "تم حفظ البيانات" : "Profile saved", "success"); } catch (error) { show(userSafeError(error, locale), "error"); } finally { setBusy(false); } }}><label className="text-sm font-bold">{locale === "ar" ? "الاسم" : "Name"}<input className="field mt-1" name="fullName" defaultValue={customer.fullName} maxLength={120} required /></label><label className="text-sm font-bold">{locale === "ar" ? "الهاتف" : "Phone"}<input className="field mt-1" name="phone" defaultValue={customer.phone} maxLength={30} required /></label><label className="text-sm font-bold sm:col-span-2">{locale === "ar" ? "البريد" : "Email"}<input className="field mt-1" name="email" type="email" defaultValue={customer.email ?? ""} maxLength={120} /></label><Button disabled={busy}>{locale === "ar" ? "حفظ" : "Save"}</Button></form><div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5"><h2 className="font-bold text-danger">{locale === "ar" ? "حذف الحساب" : "Delete account"}</h2><p className="mt-2 text-sm text-muted">{locale === "ar" ? "اكتب حذف لتأكيد الإجراء النهائي." : "Type DELETE to confirm this permanent action."}</p><input className="field mt-3 max-w-xs" value={confirm} onChange={(event) => setConfirm(event.target.value)} /><Button variant="danger" className="mt-3" disabled={confirm !== (locale === "ar" ? "حذف" : "DELETE")} onClick={async () => { try { await apiClient(toCustomerBff(customerEndpoints.me), { method: "DELETE" }); await apiClient(toAuthBff(customerEndpoints.logout), { method: "POST" }).catch(() => undefined); router.replace(localePath(locale)); router.refresh(); } catch (error) { show(userSafeError(error, locale), "error"); } }}>{locale === "ar" ? "حذف الحساب نهائيًا" : "Delete account permanently"}</Button></div></div>;
}

function Addresses({ locale }: { locale: Locale }) {
  const [items, setItems] = useState<Address[]>([]); const [loading, setLoading] = useState(true); const { show } = useToast();
  const load = useCallback(() => apiClient<Address[]>(toCustomerBff(customerEndpoints.addresses)).then(setItems).finally(() => setLoading(false)), []);
  useEffect(() => { void load().catch((error) => show(userSafeError(error, locale), "error")); }, [load, locale, show]);
  return <div><div className="flex items-center justify-between"><h1 className="text-3xl font-black">{locale === "ar" ? "العناوين" : "Addresses"}</h1></div><p className="mt-2 text-sm text-muted">{locale === "ar" ? "العقد الحالي يدعم الإضافة والحذف والاختيار دون تعديل عنوان قائم." : "The current contract supports add, delete and select; existing addresses cannot be edited."}</p><form className="surface-card mt-5 grid gap-3 p-5 sm:grid-cols-2" onSubmit={async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); try { await apiClient(toCustomerBff(customerEndpoints.addresses), { method: "POST", body: JSON.stringify({ addressLine: String(form.get("addressLine") ?? "").trim(), city: String(form.get("city") ?? "").trim() || undefined, area: String(form.get("area") ?? "").trim() || undefined, notes: String(form.get("notes") ?? "").trim() || undefined, isDefault: form.get("isDefault") === "on" }) }); event.currentTarget.reset(); await load(); show(locale === "ar" ? "أضيف العنوان" : "Address added", "success"); } catch (error) { show(userSafeError(error, locale), "error"); } }}><label className="text-sm font-bold sm:col-span-2">{locale === "ar" ? "العنوان" : "Address"}<input className="field mt-1" name="addressLine" maxLength={250} required /></label><label className="text-sm font-bold">{locale === "ar" ? "المدينة" : "City"}<input className="field mt-1" name="city" maxLength={120} /></label><label className="text-sm font-bold">{locale === "ar" ? "المنطقة" : "Area"}<input className="field mt-1" name="area" maxLength={120} /></label><label className="text-sm font-bold sm:col-span-2">{locale === "ar" ? "ملاحظات" : "Notes"}<textarea className="field mt-1" name="notes" maxLength={500} /></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isDefault" />{locale === "ar" ? "العنوان الافتراضي" : "Default address"}</label><Button><Plus className="size-4" />{locale === "ar" ? "إضافة" : "Add"}</Button></form>{loading ? <div className="skeleton mt-5 h-32 rounded-xl" /> : <div className="mt-5 grid gap-3 sm:grid-cols-2">{items.map((item) => <article key={item.id} className="surface-card p-4"><div className="flex items-start justify-between gap-3"><div><strong>{item.addressLine}</strong><p className="mt-2 text-sm text-muted">{[item.city, item.area].filter(Boolean).join("، ")}</p>{item.isDefault ? <span className="mt-3 inline-block rounded bg-emerald-50 px-2 py-1 text-xs font-bold text-success">{locale === "ar" ? "افتراضي" : "Default"}</span> : null}</div><button className="grid size-10 place-items-center text-danger" onClick={async () => { try { await apiClient(toCustomerBff(customerEndpoints.address(item.id)), { method: "DELETE" }); await load(); } catch (error) { show(userSafeError(error, locale), "error"); } }} aria-label={locale === "ar" ? "حذف العنوان" : "Delete address"}><Trash2 className="size-4" /></button></div></article>)}</div>}</div>;
}

function Orders({ locale }: { locale: Locale }) {
  const [data, setData] = useState<{ orders: CustomerOrder[]; total: number } | null>(null); const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { apiClient<{ orders: CustomerOrder[]; total: number }>(`${toCustomerBff(customerEndpoints.orders)}?limit=20&offset=0`).then(setData).catch((reason) => setError(userSafeError(reason, locale))); }, [locale]);

  const loadMore = async () => {
    if (!data || busy) return;
    setBusy(true);
    try {
      const next = await apiClient<{ orders: CustomerOrder[]; total: number }>(`${toCustomerBff(customerEndpoints.orders)}?limit=20&offset=${data.orders.length}`);
      setData({ orders: [...data.orders, ...next.orders], total: next.total });
    } catch (reason) {
      setError(userSafeError(reason, locale));
    } finally {
      setBusy(false);
    }
  };

  const hasMore = data && data.orders.length < data.total;

  return <Resource title={locale === "ar" ? "الطلبات" : "Orders"} error={error} loading={!data}>{data?.orders.length ? <div className="space-y-3">{data.orders.map((order) => <article key={order.id} className="surface-card grid gap-3 p-4 sm:grid-cols-4"><div><span className="text-xs text-muted">{locale === "ar" ? "الطلب" : "Order"}</span><strong className="block" dir="ltr">{order.orderCode}</strong></div><div><span className="text-xs text-muted">{locale === "ar" ? "الحالة" : "Status"}</span><strong className="block">{order.status}</strong></div><div><span className="text-xs text-muted">{locale === "ar" ? "الإجمالي" : "Total"}</span><strong className="block" dir="ltr">{formatMoney(order.total, order.currencyCode, locale)}</strong></div><ButtonLink variant="secondary" href={localePath(locale, `/track-order/${encodeURIComponent(order.orderCode)}`)}>{locale === "ar" ? "تتبع" : "Track"}</ButtonLink></article>)}{hasMore ? <Button variant="secondary" className="w-full" disabled={busy} onClick={loadMore}>{locale === "ar" ? "تحميل المزيد" : "Load more"}</Button> : null}</div> : data ? <EmptyState title={locale === "ar" ? "لا توجد طلبات" : "No orders"} /> : null}</Resource>;
}

function Wishlist({ locale }: { locale: Locale }) {
  const [items, setItems] = useState<WishlistItem[] | null>(null); const { show } = useToast(); const load = useCallback(() => apiClient<WishlistItem[]>(toCustomerBff(customerEndpoints.wishlist)).then(setItems), []);
  useEffect(() => { void load().catch((error) => show(userSafeError(error, locale), "error")); }, [load, locale, show]);
  return <Resource title={locale === "ar" ? "المفضلة" : "Wishlist"} loading={!items}>{items?.length ? <div className="grid gap-3 sm:grid-cols-2">{items.map((item) => <article key={item.id} className="surface-card grid grid-cols-[5rem_1fr_auto] gap-3 p-3"><div className="relative aspect-square overflow-hidden rounded-lg bg-surface"><MediaImage src={item.primaryImageUrl} alt={item.title} sizes="80px" /></div><div><Link className="font-bold hover:text-brand" href={localePath(locale, `/product/${item.slug}`)}>{item.title}</Link>{item.priceFrom !== null ? <p className="mt-2 text-sm text-brand" dir="ltr">{item.priceFrom}</p> : null}</div><button className="grid size-10 place-items-center text-danger" onClick={async () => { await apiClient(toCustomerBff(customerEndpoints.wishlistProduct(item.productId)), { method: "DELETE" }); await load(); }} aria-label={locale === "ar" ? "حذف" : "Remove"}><Trash2 className="size-4" /></button></article>)}</div> : items ? <EmptyState title={locale === "ar" ? "المفضلة فارغة" : "Your wishlist is empty"} /> : null}</Resource>;
}

function Reviews({ locale }: { locale: Locale }) {
  const [items, setItems] = useState<Review[] | null>(null); const [editingId, setEditingId] = useState<string | null>(null); const { show } = useToast(); const load = useCallback(() => apiClient<Review[]>(toCustomerBff(customerEndpoints.reviews)).then(setItems), []);
  useEffect(() => { void load().catch((error) => show(userSafeError(error, locale), "error")); }, [load, locale, show]);

  const renderEditForm = (review: Review) => {
    return (
      <form className="mt-4 grid gap-3 border-t border-line pt-4" onSubmit={async (event) => {
        event.preventDefault(); const form = new FormData(event.currentTarget);
        try {
          await apiClient(toCustomerBff(customerEndpoints.review(review.id)), {
            method: "PATCH",
            body: JSON.stringify({ rating: Number(form.get("rating")), comment: String(form.get("comment") ?? "").trim() || undefined })
          });
          setEditingId(null); await load();
          show(locale === "ar" ? "تم تحديث التقييم" : "Review updated", "success");
        } catch (error) { show(userSafeError(error, locale), "error"); }
      }}>
        <label className="text-sm font-bold">{locale === "ar" ? "التقييم" : "Rating"}
          <select required name="rating" defaultValue={review.rating} className="field mt-1">
            {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} / 5</option>)}
          </select>
        </label>
        <label className="text-sm font-bold">{locale === "ar" ? "تعليقك" : "Comment"}
          <textarea name="comment" defaultValue={review.comment ?? ""} maxLength={1000} className="field mt-1 min-h-20" />
        </label>
        <div className="flex gap-2">
          <Button>{locale === "ar" ? "حفظ" : "Save"}</Button>
          <Button type="button" variant="secondary" onClick={() => setEditingId(null)}>{locale === "ar" ? "إلغاء" : "Cancel"}</Button>
        </div>
      </form>
    );
  };

  return <Resource title={locale === "ar" ? "تقييماتي" : "My reviews"} loading={!items}>{items?.length ? <div className="space-y-3">{items.map((review) => <article key={review.id} className="surface-card p-4"><div className="flex items-start justify-between"><div><strong>{review.productTitle ?? review.productId}</strong><p className="mt-1 text-accent">{"★".repeat(review.rating)}</p><span className="mt-2 inline-block text-xs text-muted">{review.moderationStatus}</span></div><div className="flex items-center gap-1"><button className="grid size-10 place-items-center text-muted hover:text-brand" onClick={() => setEditingId(review.id)} aria-label={locale === "ar" ? "تعديل" : "Edit"}><Pencil className="size-4" /></button><button className="grid size-10 place-items-center text-danger" onClick={async () => { try { await apiClient(toCustomerBff(customerEndpoints.review(review.id)), { method: "DELETE" }); await load(); } catch (error) { show(userSafeError(error, locale), "error"); } }} aria-label={locale === "ar" ? "حذف" : "Delete"}><Trash2 className="size-4" /></button></div></div>{editingId === review.id ? renderEditForm(review) : review.comment ? <p className="mt-3 text-muted">{review.comment}</p> : null}</article>)}</div> : items ? <EmptyState title={locale === "ar" ? "لم تكتب تقييمات بعد" : "You have not written reviews yet"} /> : null}</Resource>;
}

function Loyalty({ locale }: { locale: Locale }) {
  const [wallet, setWallet] = useState<LoyaltyWallet | null>(null); const [ledger, setLedger] = useState<LoyaltyLedgerEntry[] | null>(null); const [error, setError] = useState<string | null>(null);
  useEffect(() => { Promise.all([apiClient<LoyaltyWallet>(toCustomerBff(customerEndpoints.loyaltyWallet)), apiClient<LoyaltyLedgerEntry[]>(toCustomerBff(customerEndpoints.loyaltyLedger))]).then(([nextWallet, nextLedger]) => { setWallet(nextWallet); setLedger(nextLedger); }).catch((reason) => setError(userSafeError(reason, locale))); }, [locale]);
  return <Resource title={locale === "ar" ? "نقاط الولاء" : "Loyalty points"} error={error} loading={!wallet || !ledger}>{wallet ? <div className="mb-5 grid gap-3 sm:grid-cols-3"><Stat label={locale === "ar" ? "المتاح" : "Available"} value={wallet.availablePoints} /><Stat label={locale === "ar" ? "المكتسب" : "Lifetime earned"} value={wallet.lifetimeEarnedPoints} /><Stat label={locale === "ar" ? "المستخدم" : "Redeemed"} value={wallet.lifetimeRedeemedPoints} /></div> : null}{ledger?.length ? <div className="surface-card divide-y divide-line">{ledger.map((entry) => <div key={entry.id} className="flex items-center justify-between gap-3 p-4"><div><strong>{entry.entryType}</strong><p className="text-xs text-muted">{formatDate(entry.createdAt, locale)}</p></div><span className={entry.pointsDelta >= 0 ? "font-bold text-success" : "font-bold text-danger"} dir="ltr">{entry.pointsDelta > 0 ? "+" : ""}{entry.pointsDelta}</span></div>)}</div> : ledger ? <EmptyState title={locale === "ar" ? "لا توجد حركات نقاط" : "No loyalty activity"} /> : null}</Resource>;
}

function Notifications({ locale }: { locale: Locale }) {
  const [data, setData] = useState<PageResult<NotificationItem> | null>(null); const [page, setPage] = useState(1); const [busy, setBusy] = useState(false); const { show } = useToast(); const load = useCallback(() => apiClient<PageResult<NotificationItem>>(`${toCustomerBff(customerEndpoints.notifications)}?page=1&limit=20`).then(setData), []);
  useEffect(() => { void load().catch((error) => show(userSafeError(error, locale), "error")); }, [load, locale, show]);

  const loadMore = async () => {
    if (!data || busy) return;
    setBusy(true);
    try {
      const nextPage = page + 1;
      const next = await apiClient<PageResult<NotificationItem>>(`${toCustomerBff(customerEndpoints.notifications)}?page=${nextPage}&limit=20`);
      setData({ ...next, items: [...data.items, ...next.items] });
      setPage(nextPage);
    } catch (error) {
      show(userSafeError(error, locale), "error");
    } finally {
      setBusy(false);
    }
  };

  const hasMore = data && data.items.length < data.total;

  return <Resource title={locale === "ar" ? "الإشعارات" : "Notifications"} loading={!data} action={<Button variant="secondary" onClick={async () => { await apiClient(toCustomerBff(customerEndpoints.notificationsReadAll), { method: "PATCH" }); await load(); }}>{locale === "ar" ? "تحديد الكل كمقروء" : "Mark all read"}</Button>}>{data?.items.length ? <div className="space-y-3">{data.items.map((item) => <button key={item.id} className={`surface-card block w-full p-4 text-start ${item.status === "unread" ? "border-brand" : ""}`} onClick={async () => { if (item.status === "unread") { await apiClient(toCustomerBff(customerEndpoints.notificationRead(item.id)), { method: "PATCH" }); await load(); } }}><strong>{item.title}</strong><p className="mt-2 text-sm leading-7 text-muted">{item.body}</p><time className="mt-2 block text-xs text-muted">{formatDate(item.createdAt, locale)}</time></button>)}{hasMore ? <Button variant="secondary" className="w-full" disabled={busy} onClick={loadMore}>{locale === "ar" ? "تحميل المزيد" : "Load more"}</Button> : null}</div> : data ? <EmptyState title={locale === "ar" ? "لا توجد إشعارات" : "No notifications"} /> : null}</Resource>;
}

function Support({ locale }: { locale: Locale }) {
  const [data, setData] = useState<PageResult<SupportTicket> | null>(null); const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1); const [busy, setBusy] = useState(false);
  useEffect(() => { apiClient<PageResult<SupportTicket>>(`${toCustomerBff(customerEndpoints.supportTickets)}?page=1&limit=20`).then(setData).catch((reason) => setError(userSafeError(reason, locale))); }, [locale]);

  const loadMore = async () => {
    if (!data || busy) return;
    setBusy(true);
    try {
      const nextPage = page + 1;
      const next = await apiClient<PageResult<SupportTicket>>(`${toCustomerBff(customerEndpoints.supportTickets)}?page=${nextPage}&limit=20`);
      setData({ ...next, items: [...data.items, ...next.items] });
      setPage(nextPage);
    } catch (error) {
      setError(userSafeError(error, locale));
    } finally {
      setBusy(false);
    }
  };

  const hasMore = data && data.items.length < data.total;

  return <Resource title={locale === "ar" ? "تذاكر الدعم" : "Support tickets"} loading={!data} error={error} action={<ButtonLink href={localePath(locale, "/account/support/new")}><Plus className="size-4" />{locale === "ar" ? "تذكرة جديدة" : "New ticket"}</ButtonLink>}>{data?.items.length ? <div className="space-y-3">{data.items.map((ticket) => <Link key={ticket.id} className="surface-card block p-4 hover:border-brand" href={localePath(locale, `/account/support/${ticket.id}`)}><div className="flex items-center justify-between gap-3"><strong>{ticket.subject}</strong><span className="rounded bg-surface px-2 py-1 text-xs">{ticket.status}</span></div><p className="mt-2 text-xs text-muted">{formatDate(ticket.createdAt, locale)}</p></Link>)}{hasMore ? <Button variant="secondary" className="w-full" disabled={busy} onClick={loadMore}>{locale === "ar" ? "تحميل المزيد" : "Load more"}</Button> : null}</div> : data ? <EmptyState title={locale === "ar" ? "لا توجد تذاكر" : "No support tickets"} /> : null}</Resource>;
}

function NewTicket({ locale }: { locale: Locale }) {
  const router = useRouter(); const { show } = useToast();
  return <div><h1 className="text-3xl font-black">{locale === "ar" ? "تذكرة دعم جديدة" : "New support ticket"}</h1><form className="surface-card mt-6 grid gap-4 p-5" onSubmit={async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); try { const ticket = await apiClient<SupportTicket>(toCustomerBff(customerEndpoints.supportTickets), { method: "POST", body: JSON.stringify({ priority: form.get("priority"), subject: String(form.get("subject") ?? "").trim(), description: String(form.get("description") ?? "").trim() || undefined, message: String(form.get("message") ?? "").trim() }) }); router.replace(localePath(locale, `/account/support/${ticket.id}`)); } catch (error) { show(userSafeError(error, locale), "error"); } }}><label className="text-sm font-bold">{locale === "ar" ? "الأولوية" : "Priority"}<select name="priority" className="field mt-1">{["low","normal","high","urgent"].map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label className="text-sm font-bold">{locale === "ar" ? "الموضوع" : "Subject"}<input name="subject" className="field mt-1" maxLength={200} required /></label><label className="text-sm font-bold">{locale === "ar" ? "الوصف" : "Description"}<textarea name="description" className="field mt-1 min-h-24" maxLength={4000} /></label><label className="text-sm font-bold">{locale === "ar" ? "الرسالة" : "Message"}<textarea name="message" className="field mt-1 min-h-32" maxLength={4000} required /></label><Button>{locale === "ar" ? "إنشاء التذكرة" : "Create ticket"}</Button></form></div>;
}

function TicketDetails({ locale, ticketId }: { locale: Locale; ticketId: string }) {
  const [data, setData] = useState<{ ticket: SupportTicket; messages: SupportMessage[]; events: unknown[] } | null>(null); const { show } = useToast(); const load = useCallback(() => apiClient<{ ticket: SupportTicket; messages: SupportMessage[]; events: unknown[] }>(toCustomerBff(customerEndpoints.supportTicket(ticketId))).then(setData), [ticketId]);
  useEffect(() => { void load().catch((error) => show(userSafeError(error, locale), "error")); }, [load, locale, show]);
  if (!data) return <div className="skeleton h-80 rounded-xl" />;
  return <div><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-black">{data.ticket.subject}</h1><span className="mt-2 inline-block rounded bg-surface px-2 py-1 text-xs">{data.ticket.status}</span></div>{["closed","resolved"].includes(data.ticket.status) ? <Button variant="secondary" onClick={async () => { await apiClient(toCustomerBff(customerEndpoints.supportStatus(ticketId)), { method: "PATCH", body: JSON.stringify({ status: "open" }) }); await load(); }}>{locale === "ar" ? "إعادة الفتح" : "Reopen"}</Button> : <Button variant="secondary" onClick={async () => { await apiClient(toCustomerBff(customerEndpoints.supportStatus(ticketId)), { method: "PATCH", body: JSON.stringify({ status: "closed" }) }); await load(); }}>{locale === "ar" ? "إغلاق" : "Close"}</Button>}</div><div className="mt-6 space-y-3">{data.messages.map((message) => <article key={message.id} className={`max-w-[85%] rounded-xl p-4 ${message.authorType === "customer" ? "ms-auto bg-brand text-white" : "me-auto bg-surface"}`}><strong className="text-xs">{message.authorLabel}</strong><p className="mt-2 whitespace-pre-wrap text-sm leading-7">{message.message}</p><time className="mt-2 block text-[11px] opacity-70">{formatDate(message.createdAt, locale)}</time></article>)}</div>{!["closed","resolved"].includes(data.ticket.status) ? <form className="mt-6 flex gap-2" onSubmit={async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); try { await apiClient(toCustomerBff(customerEndpoints.supportMessages(ticketId)), { method: "POST", body: JSON.stringify({ message: String(form.get("message") ?? "").trim() }) }); event.currentTarget.reset(); await load(); } catch (error) { show(userSafeError(error, locale), "error"); } }}><textarea className="field min-h-24 flex-1" name="message" maxLength={4000} required /><Button>{locale === "ar" ? "إرسال" : "Send"}</Button></form> : null}</div>;
}

function Resource({ title, children, loading = false, error, action }: { title: string; children: React.ReactNode; loading?: boolean; error?: string | null; action?: React.ReactNode }) {
  return <div><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-black">{title}</h1>{action}</div>{error ? <Alert tone="error">{error}</Alert> : loading ? <div className="skeleton h-64 rounded-xl" /> : children}</div>;
}

function Stat({ label, value }: { label: string; value: number }) { return <div className="surface-card p-5"><span className="text-sm text-muted">{label}</span><strong className="mt-2 block text-3xl text-brand" dir="ltr">{value}</strong></div>; }
