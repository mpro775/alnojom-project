"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BellRing, Check, Minus, Plus, ShoppingBag } from "lucide-react";
import type { Locale, ProductDetails, ProductVariant } from "@/lib/api/contracts";
import { localizedField } from "@/lib/i18n/fields";
import { localePath } from "@/lib/i18n/locales";
import { formatMoney, validDiscountPercent } from "@/lib/format/commerce";
import { MediaImage } from "@/components/ui/media-image";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { WishlistButton } from "@/features/wishlist/wishlist-button";
import { useCart } from "@/features/cart/cart-context";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api/client";
import { ApiError, userSafeError } from "@/lib/api/error";
import { customerEndpoints, toCustomerBff } from "@/lib/api/endpoints";
import { attributeOptions, initialVariant, matchingVariant, optionAvailable } from "@/features/catalog/variants";

export function ProductDetailsInteractive({ product, locale, currency }: { product: ProductDetails; locale: Locale; currency: string }) {
  const initial = initialVariant(product.variants);
  const [selected, setSelected] = useState<Record<string, string>>(initial?.attributes ?? {});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(initial);
  const [quantity, setQuantity] = useState(product.minOrderQuantity);
  const [activeImage, setActiveImage] = useState<string | null>(initial ? product.images.find((image) => image.variantId === initial.id)?.id ?? product.images[0]?.id ?? null : product.images[0]?.id ?? null);
  const [busy, setBusy] = useState(false);
  const options = useMemo(() => attributeOptions(product.variants), [product.variants]);
  const { addItem } = useCart();
  const { show } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const title = localizedField({ ar: product.titleAr, en: product.titleEn, generic: product.title }, locale);
  const available = selectedVariant ? product.stockUnlimited || selectedVariant.stockQuantity > 0 : false;
  const maxQuantity = Math.max(product.minOrderQuantity, Math.min(50, product.maxOrderQuantity ?? 50, product.stockUnlimited ? 50 : selectedVariant?.stockQuantity ?? 0));
  const discount = selectedVariant ? validDiscountPercent(selectedVariant.price, selectedVariant.compareAtPrice) : null;
  const visibleImages = product.images.length ? product.images : product.primaryImageUrl ? [{ id: "primary", url: product.primaryImageUrl, altText: title, sortOrder: 0, variantId: null }] : [];
  const currentImage = visibleImages.find((image) => image.id === activeImage) ?? visibleImages[0];

  function choose(attribute: string, value: string) {
    const next = { ...selected, [attribute]: value };
    setSelected(next);
    const variant = matchingVariant(product.variants, next);
    setSelectedVariant(variant);
    setQuantity(product.minOrderQuantity);
    if (variant) {
      const variantImage = product.images.find((image) => image.variantId === variant.id);
      if (variantImage) setActiveImage(variantImage.id);
    }
  }

  async function add() {
    if (!selectedVariant || !available) return;
    setBusy(true);
    try {
      await addItem(selectedVariant.id, quantity, currency);
      show(locale === "ar" ? "أضيف المنتج إلى السلة" : "Product added to cart", "success");
    } catch (error) {
      show(userSafeError(error, locale), "error");
    } finally {
      setBusy(false);
    }
  }

  async function subscribeRestock() {
    setBusy(true);
    try {
      await apiClient(toCustomerBff(customerEndpoints.restock(product.id)), { method: "POST" });
      show(locale === "ar" ? "سنبلغك عند توفر المنتج" : "We will notify you when it is back", "success");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.push(`${localePath(locale, "/login")}?returnTo=${encodeURIComponent(pathname)}`);
      } else show(userSafeError(error, locale), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_.9fr]">
      <section aria-label={locale === "ar" ? "صور المنتج" : "Product images"}>
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-surface"><MediaImage src={currentImage?.url} alt={currentImage?.altText ?? title} sizes="(max-width: 1024px) 100vw, 50vw" priority /></div>
        {visibleImages.length > 1 ? <div className="mt-3 flex snap-x gap-2 overflow-x-auto pb-2">{visibleImages.map((image) => <button key={image.id} onClick={() => setActiveImage(image.id)} className={`relative size-20 shrink-0 snap-start overflow-hidden rounded-lg border bg-surface ${activeImage === image.id ? "border-brand" : "border-line"}`} aria-label={image.altText ?? title} aria-pressed={activeImage === image.id}><MediaImage src={image.url} alt="" sizes="80px" /></button>)}</div> : null}
      </section>
      <section>
        <div className="flex items-start justify-between gap-3"><div>{product.brand ? <p className="text-xs font-bold uppercase tracking-wide text-muted">{product.brand}</p> : null}{product.productLabel ? <span className="mt-2 inline-block rounded-md bg-accent/25 px-2 py-1 text-xs font-bold text-brand-strong">{product.productLabel}</span> : null}</div><WishlistButton productId={product.id} locale={locale} /></div>
        <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">{title}</h1>
        {product.ratingCount > 0 ? <p className="mt-3 text-sm text-muted">★ {product.ratingAvg.toFixed(1)} ({product.ratingCount})</p> : null}
        <div className="mt-6 flex flex-wrap items-baseline gap-3" aria-live="polite">{selectedVariant ? <><strong className="text-2xl text-brand" dir="ltr">{formatMoney(selectedVariant.price, currency, locale)}</strong>{selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price ? <del className="text-muted" dir="ltr">{formatMoney(selectedVariant.compareAtPrice, currency, locale)}</del> : null}{discount ? <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-bold text-danger">{locale === "ar" ? `خصم ${discount}٪` : `${discount}% off`}</span> : null}</> : <span className="text-sm font-bold text-muted">{locale === "ar" ? "اختر الخيارات لعرض السعر" : "Select options to see the price"}</span>}</div>
        {options.length ? <div className="mt-7 space-y-5">{options.map((option) => <fieldset key={option.name}><legend className="mb-2 text-sm font-bold">{option.name}</legend><div className="flex flex-wrap gap-2">{option.values.map((value) => { const chosen = selected[option.name] === value; const possible = optionAvailable(product.variants, Object.fromEntries(Object.entries(selected).filter(([key]) => key !== option.name)), option.name, value, product.stockUnlimited); return <button type="button" key={value} disabled={!possible} aria-pressed={chosen} onClick={() => choose(option.name, value)} className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm ${chosen ? "border-brand bg-brand text-white" : "border-line bg-white hover:border-brand"} disabled:cursor-not-allowed disabled:opacity-35`}>{chosen ? <Check className="size-4" /> : null}{value}</button>; })}</div></fieldset>)}</div> : null}
        <div className="mt-6">{!selectedVariant ? <Alert>{locale === "ar" ? "اختر مواصفات المنتج أولًا." : "Choose product options first."}</Alert> : available ? <Alert tone="success">{locale === "ar" ? product.stockUnlimited ? "متوفر للطلب" : `متوفر — ${selectedVariant.stockQuantity} قطعة` : product.stockUnlimited ? "Available to order" : `${selectedVariant.stockQuantity} available`}</Alert> : <Alert tone="error">{locale === "ar" ? "غير متوفر حاليًا" : "Currently unavailable"}</Alert>}</div>
        {selectedVariant ? <p className="mt-3 text-xs text-muted" dir="ltr">SKU: {selectedVariant.sku}</p> : null}
        <div className="mt-6 flex flex-wrap gap-3">{available ? <><div className="flex items-center rounded-lg border border-line"><button className="grid size-11 place-items-center" onClick={() => setQuantity((value) => Math.max(product.minOrderQuantity, value - 1))} disabled={quantity <= product.minOrderQuantity} aria-label={locale === "ar" ? "تقليل الكمية" : "Decrease quantity"}><Minus className="size-4" /></button><span className="min-w-10 text-center" aria-live="polite">{quantity}</span><button className="grid size-11 place-items-center" onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))} disabled={quantity >= maxQuantity} aria-label={locale === "ar" ? "زيادة الكمية" : "Increase quantity"}><Plus className="size-4" /></button></div><Button className="flex-1" onClick={() => void add()} disabled={busy || !selectedVariant}><ShoppingBag className="size-5" />{locale === "ar" ? "أضف إلى السلة" : "Add to cart"}</Button></> : selectedVariant ? <Button variant="secondary" className="w-full" onClick={() => void subscribeRestock()} disabled={busy}><BellRing className="size-5" />{locale === "ar" ? "أبلغني عند التوفر" : "Notify me when available"}</Button> : null}</div>
        <div className="mt-7 grid grid-cols-2 gap-2 text-xs text-muted"><div className="rounded-lg bg-surface p-3">{locale === "ar" ? "الأسعار والمخزون من نظام المتجر" : "Live server price and stock"}</div><div className="rounded-lg bg-surface p-3">{locale === "ar" ? "الشحن والدفع يحددان عند الإتمام" : "Shipping and payment at checkout"}</div></div>
      </section>
    </div>
  );
}
