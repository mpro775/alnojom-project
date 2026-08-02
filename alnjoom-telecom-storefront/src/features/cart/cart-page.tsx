"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { Locale, Product, ProductList } from "@/lib/api/contracts";
import { apiClient } from "@/lib/api/client";
import { publicEndpoints, toStorefrontBff } from "@/lib/api/endpoints";
import { localePath } from "@/lib/i18n/locales";
import { formatMoney } from "@/lib/format/commerce";
import { MediaImage } from "@/components/ui/media-image";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { useCart } from "./cart-context";

export function CartPage({ locale }: { locale: Locale }) {
  const { cart, loading, updateItem, removeItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState(false);
  const ids = useMemo(() => [...new Set(cart?.items.map((item) => item.productId) ?? [])], [cart]);

  useEffect(() => {
    if (!ids.length) return;
    const params = new URLSearchParams();
    ids.forEach((id) => params.append("ids", id));
    apiClient<ProductList>(`${toStorefrontBff(publicEndpoints.products)}?${params.toString()}`)
      .then((result) => setProducts(result.items))
      .catch(() => setError(true));
  }, [ids]);

  if (loading) return <div className="container-shell section-space"><div className="skeleton h-72 rounded-xl" /></div>;
  if (!cart?.items.length) return <div className="container-shell section-space"><EmptyState title={locale === "ar" ? "سلة التسوق فارغة" : "Your cart is empty"} action={<ButtonLink href={localePath(locale, "/products")}>{locale === "ar" ? "ابدأ التسوق" : "Start shopping"}</ButtonLink>} /></div>;

  const productById = new Map(products.map((product) => [product.id, product]));
  return (
    <main id="main-content" className="container-shell section-space">
      <h1 className="mb-8 text-3xl font-black">{locale === "ar" ? "سلة التسوق" : "Shopping cart"}</h1>
      {error ? <Alert className="mb-5">{locale === "ar" ? "تعذّر تحميل صور وروابط المنتجات، بينما بقيت أسعار السلة من الخادم صحيحة." : "Product images and links could not load; server cart prices remain authoritative."}</Alert> : null}
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section aria-label={locale === "ar" ? "منتجات السلة" : "Cart items"} className="space-y-3">
          {cart.items.map((item) => {
            const product = productById.get(item.productId);
            return (
              <article key={item.variantId} className="surface-card grid grid-cols-[5.5rem_1fr] gap-4 p-3 sm:grid-cols-[7rem_1fr_auto]">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-surface"><MediaImage src={product?.primaryImageUrl} alt={product?.title ?? item.title} sizes="112px" /></div>
                <div>
                  {product ? <Link className="font-bold hover:text-brand" href={localePath(locale, `/product/${product.slug}`)}>{item.title}</Link> : <h2 className="font-bold">{item.title}</h2>}
                  <p className="mt-1 text-xs text-muted" dir="ltr">SKU: {item.sku}</p>
                  <p className="mt-3 font-bold text-brand" dir="ltr">{formatMoney(item.lineTotal, cart.currencyCode, locale)}</p>
                </div>
                <div className="col-span-2 flex items-center justify-end sm:col-span-1">
                  <div className="flex items-center rounded-lg border border-line">
                    <button className="grid size-10 place-items-center" onClick={() => void updateItem(item.variantId, Math.max(0, item.quantity - 1))} aria-label={locale === "ar" ? "تقليل الكمية" : "Decrease quantity"}><Minus className="size-4" /></button>
                    <span className="min-w-9 text-center">{item.quantity}</span>
                    <button className="grid size-10 place-items-center" onClick={() => void updateItem(item.variantId, Math.min(50, item.quantity + 1))} aria-label={locale === "ar" ? "زيادة الكمية" : "Increase quantity"}><Plus className="size-4" /></button>
                    <button className="grid size-10 place-items-center text-danger" onClick={() => void removeItem(item.variantId)} aria-label={locale === "ar" ? "حذف" : "Remove"}><Trash2 className="size-4" /></button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
        <aside className="surface-card h-fit p-5">
          <h2 className="text-lg font-bold">{locale === "ar" ? "ملخص السلة" : "Cart summary"}</h2>
          <div className="my-5 flex items-center justify-between border-y border-line py-4"><span>{locale === "ar" ? "المجموع الفرعي" : "Subtotal"}</span><strong dir="ltr">{formatMoney(cart.subtotal, cart.currencyCode, locale)}</strong></div>
          <p className="mb-5 text-xs leading-6 text-muted">{locale === "ar" ? "الشحن والخصومات والمجموع النهائي يحسبها الخادم في صفحة الدفع." : "Shipping, discounts and the final total are calculated by the server at checkout."}</p>
          <ButtonLink className="w-full" href={localePath(locale, "/checkout")}>{locale === "ar" ? "الانتقال للدفع" : "Proceed to checkout"}</ButtonLink>
        </aside>
      </div>
    </main>
  );
}
