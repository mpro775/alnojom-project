import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, CreditCard, Truck } from "lucide-react";
import type { Category, Locale, ProductList, StoreConfig } from "@/lib/api/contracts";
import { t } from "@/lib/i18n/content";
import { localizedField } from "@/lib/i18n/fields";
import { localePath } from "@/lib/i18n/locales";
import { CategoryTile } from "@/components/catalog/category-tile";
import { ProductGrid } from "@/components/product/product-grid";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MediaImage } from "@/components/ui/media-image";

export function HomePage({ locale, config, categories, featured, latest }: { locale: Locale; config: StoreConfig | null; categories: Category[]; featured: ProductList; latest: ProductList }) {
  const content = t(locale);
  const roots = categories.filter((category) => !category.parentId).slice(0, 8);
  const currency = config?.storeSettings.currencyCode ?? "";
  const spotlight = featured.items[0] ?? latest.items[0];
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;
  return (
    <main id="main-content">
      <section className="brand-pattern overflow-hidden bg-brand text-white">
        <div className="container-shell grid min-h-[31rem] items-center gap-8 py-12 lg:grid-cols-[1.1fr_.9fr]">
          <div><p className="mb-3 text-sm font-bold text-accent">{content.heroEyebrow}</p><h1 className="max-w-2xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{content.heroTitle}</h1><p className="mt-5 max-w-xl text-base leading-8 text-white/80 sm:text-lg">{content.heroBody}</p><div className="mt-7 flex flex-wrap gap-3"><ButtonLink className="bg-accent text-brand-strong hover:bg-white" href={localePath(locale, "/products")}>{content.shopNow}<Arrow className="size-4" /></ButtonLink>{roots[0] ? <ButtonLink variant="secondary" className="border-white/30 bg-white/10 text-white hover:bg-white/20" href={localePath(locale, `/category/${roots[0].slug}`)}>{localizedField({ ar: roots[0].nameAr, en: roots[0].nameEn, generic: roots[0].name }, locale)}</ButtonLink> : null}</div></div>
          <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl"><div className="relative size-full overflow-hidden rounded-[1.4rem] bg-white"><MediaImage src={spotlight?.primaryImageUrl} alt={spotlight ? localizedField({ ar: spotlight.titleAr, en: spotlight.titleEn, generic: spotlight.title }, locale) : ""} sizes="(max-width: 1024px) 90vw, 430px" priority /></div>{spotlight?.productLabel ? <span className="absolute start-8 top-8 rounded-md bg-accent px-3 py-1 text-xs font-bold text-brand-strong">{spotlight.productLabel}</span> : null}</div>
        </div>
      </section>

      <section className="container-shell section-space" aria-labelledby="categories-title"><div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-sm font-bold text-brand">{locale === "ar" ? "اكتشف ما يناسبك" : "Find what fits"}</p><h2 id="categories-title" className="mt-1 text-2xl font-black sm:text-3xl">{content.categories}</h2></div><Link className="text-sm font-bold text-brand" href={localePath(locale, "/products")}>{content.allProducts}</Link></div>{roots.length ? <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{roots.map((category) => <CategoryTile key={category.id} category={category} locale={locale} />)}</div> : <EmptyState title={locale === "ar" ? "لا توجد أقسام متاحة حاليًا" : "No categories are currently available"} />}</section>

      <section className="bg-surface"><div className="container-shell section-space"><div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-sm font-bold text-brand">{locale === "ar" ? "منتجات بارزة" : "Featured technology"}</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">{content.featured}</h2></div><Link className="text-sm font-bold text-brand" href={localePath(locale, "/products?isFeatured=true")}>{locale === "ar" ? "عرض الكل" : "View all"}</Link></div>{featured.items.length ? <ProductGrid products={featured.items.slice(0, 8)} locale={locale} currency={currency} /> : <EmptyState title={locale === "ar" ? "لا توجد منتجات مميزة الآن" : "No featured products right now"} />}</div></section>

      {latest.items.length ? <section className="container-shell section-space"><div className="mb-7 flex items-end justify-between"><h2 className="text-2xl font-black sm:text-3xl">{locale === "ar" ? "استكشف المزيد" : "Explore more"}</h2><Link className="text-sm font-bold text-brand" href={localePath(locale, "/products")}>{content.allProducts}</Link></div><ProductGrid products={latest.items.slice(0, 8)} locale={locale} currency={currency} /></section> : null}

      <section className="border-y border-line bg-white"><div className="container-shell grid gap-0 py-6 sm:grid-cols-3">{content.trust.map((item, index) => { const Icon = [CreditCard, BadgeCheck, Truck][index] ?? BadgeCheck; return <div key={item} className="flex items-center gap-3 border-line px-4 py-3 sm:border-s sm:first:border-0"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent/20 text-brand"><Icon className="size-5" /></span><strong className="text-sm leading-6">{item}</strong></div>; })}</div></section>

      <section className="container-shell section-space"><div className="grid items-center gap-8 rounded-2xl bg-brand-strong p-7 text-white sm:p-10 lg:grid-cols-[1fr_auto]"><div><p className="text-sm font-bold text-accent">{locale === "ar" ? "عن النجوم" : "About Alnjoom"}</p><h2 className="mt-2 text-2xl font-black">{locale === "ar" ? "متجر تقنية عربي أولًا" : "An Arabic-first technology store"}</h2><p className="mt-3 max-w-2xl leading-8 text-white/75">{locale === "ar" ? "نقدّم تجربة واضحة تعتمد على الأسعار والمخزون وخيارات الدفع والشحن المفعلة مباشرة في نظام المتجر." : "A clear experience driven directly by the store's enabled prices, inventory, payment and fulfillment settings."}</p></div><ButtonLink className="bg-accent text-brand-strong hover:bg-white" href={localePath(locale, "/about")}>{locale === "ar" ? "اعرف المزيد" : "Learn more"}</ButtonLink></div></section>
    </main>
  );
}
