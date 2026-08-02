import Link from "next/link";
import type { Locale, Product } from "@/lib/api/contracts";
import { localizedField } from "@/lib/i18n/fields";
import { localePath } from "@/lib/i18n/locales";
import { MediaImage } from "@/components/ui/media-image";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { WishlistButton } from "@/features/wishlist/wishlist-button";

export function ProductCard({ product, locale, currency }: { product: Product; locale: Locale; currency: string }) {
  const title = localizedField({ ar: product.titleAr, en: product.titleEn, generic: product.title }, locale);
  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-white transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[var(--shadow-soft)]">
      <div className="relative aspect-square overflow-hidden bg-surface">
        <Link href={localePath(locale, `/product/${product.slug}`)} aria-label={title}>
          <MediaImage src={product.primaryImageUrl} alt={title} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-contain p-3 transition duration-300 group-hover:scale-[1.03]" />
        </Link>
        {product.productLabel ? <span className="absolute start-2 top-2 max-w-[70%] rounded-md bg-accent px-2 py-1 text-[11px] font-bold text-brand-strong">{product.productLabel}</span> : null}
        <WishlistButton productId={product.id} locale={locale} className="absolute end-2 top-2 size-10" />
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {product.brand ? <p className="mb-1 truncate text-[11px] font-bold uppercase tracking-wide text-muted">{product.brand}</p> : null}
        <h3 className="line-clamp-2 min-h-12 text-sm font-bold leading-6 sm:text-base">
          <Link className="hover:text-brand" href={localePath(locale, `/product/${product.slug}`)}>{title}</Link>
        </h3>
        <div className="mt-2">{product.ratingCount > 0 ? <Rating value={product.ratingAvg} count={product.ratingCount} label={`${product.ratingAvg} / 5`} /> : <span className="text-xs text-muted">{locale === "ar" ? "لا توجد تقييمات بعد" : "No ratings yet"}</span>}</div>
        <Price className="mt-3 block text-base font-black text-brand" amount={product.priceFrom} currency={currency} locale={locale} from />
      </div>
    </article>
  );
}
