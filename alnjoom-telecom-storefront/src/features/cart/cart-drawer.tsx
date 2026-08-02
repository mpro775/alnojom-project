"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import type { Locale } from "@/lib/api/contracts";
import { localePath } from "@/lib/i18n/locales";
import { formatMoney } from "@/lib/format/commerce";
import { ButtonLink } from "@/components/ui/button";
import { useCart } from "./cart-context";

export function CartTrigger({ locale }: { locale: Locale }) {
  const { cart, drawerOpen, setDrawerOpen } = useCart();
  return (
    <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
      <Dialog.Trigger asChild>
        <button className="relative grid size-11 place-items-center rounded-lg hover:bg-white/10" aria-label={locale === "ar" ? "فتح السلة" : "Open cart"}>
          <ShoppingBag className="size-5" />
          {cart?.totalItems ? <span className="absolute -end-1 -top-1 min-w-5 rounded-full bg-accent px-1 text-[11px] font-bold text-brand-strong">{cart.totalItems}</span> : null}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 data-[state=open]:animate-[fade_.15s_ease-out]" />
        <Dialog.Content className="fixed inset-y-0 end-0 z-50 flex w-[min(92vw,28rem)] flex-col bg-white shadow-2xl focus:outline-none">
          <header className="flex items-center justify-between border-b border-line p-4">
            <Dialog.Title className="text-lg font-bold">{locale === "ar" ? "سلة التسوق" : "Shopping cart"}</Dialog.Title>
            <Dialog.Close className="grid size-11 place-items-center rounded-lg hover:bg-surface" aria-label={locale === "ar" ? "إغلاق" : "Close"}><X className="size-5" /></Dialog.Close>
          </header>
          <DrawerItems locale={locale} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DrawerItems({ locale }: { locale: Locale }) {
  const { cart, loading, updateItem, removeItem, setDrawerOpen } = useCart();
  if (loading) return <div className="p-5 text-sm text-muted">{locale === "ar" ? "جارٍ تحميل السلة…" : "Loading cart…"}</div>;
  if (!cart?.items.length) return <div className="grid flex-1 place-items-center p-8 text-center"><div><ShoppingBag className="mx-auto mb-4 size-10 text-brand" /><p className="font-bold">{locale === "ar" ? "سلتك فارغة" : "Your cart is empty"}</p></div></div>;
  return (
    <>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {cart.items.map((item) => (
          <article key={item.variantId} className="rounded-xl border border-line p-3">
            <h3 className="text-sm font-bold leading-6">{item.title}</h3>
            <p className="mt-1 text-xs text-muted" dir="ltr">SKU: {item.sku}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="font-bold text-brand" dir="ltr">{formatMoney(item.lineTotal, cart.currencyCode, locale)}</span>
              <div className="flex items-center rounded-lg border border-line">
                <button className="grid size-9 place-items-center" onClick={() => void updateItem(item.variantId, Math.max(0, item.quantity - 1))} aria-label={locale === "ar" ? "تقليل الكمية" : "Decrease quantity"}><Minus className="size-4" /></button>
                <span className="min-w-8 text-center text-sm" aria-live="polite">{item.quantity}</span>
                <button className="grid size-9 place-items-center" onClick={() => void updateItem(item.variantId, Math.min(50, item.quantity + 1))} aria-label={locale === "ar" ? "زيادة الكمية" : "Increase quantity"}><Plus className="size-4" /></button>
                <button className="grid size-9 place-items-center text-danger" onClick={() => void removeItem(item.variantId)} aria-label={locale === "ar" ? "حذف المنتج" : "Remove item"}><Trash2 className="size-4" /></button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <footer className="border-t border-line p-4">
        <div className="mb-4 flex items-center justify-between"><span>{locale === "ar" ? "المجموع الفرعي" : "Subtotal"}</span><strong dir="ltr">{formatMoney(cart.subtotal, cart.currencyCode, locale)}</strong></div>
        <ButtonLink className="w-full" href={localePath(locale, "/cart")} onClick={() => setDrawerOpen(false)}>{locale === "ar" ? "عرض السلة" : "View cart"}</ButtonLink>
      </footer>
    </>
  );
}
