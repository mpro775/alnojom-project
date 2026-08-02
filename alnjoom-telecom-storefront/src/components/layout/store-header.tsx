import Image from "next/image";
import Link from "next/link";
import { Heart, Search, UserRound } from "lucide-react";
import type { Category, Locale, StoreConfig } from "@/lib/api/contracts";
import { t } from "@/lib/i18n/content";
import { localizedField } from "@/lib/i18n/fields";
import { localePath } from "@/lib/i18n/locales";
import { buildCategoryTree } from "@/features/catalog/category-tree";
import { LanguageSwitch } from "./language-switch";
import { CurrencySelector } from "./currency-selector";
import { MobileNavigation } from "./mobile-navigation";
import { NotificationBell } from "./notification-bell";
import { CartTrigger } from "@/features/cart/cart-drawer";

export function StoreHeader({ locale, config, categories }: { locale: Locale; config: StoreConfig | null; categories: Category[] }) {
  const content = t(locale);
  const tree = buildCategoryTree(categories);
  const settings = config?.storeSettings;
  return (
    <header>
      <div className="bg-accent py-1.5 text-center text-xs font-bold text-brand-strong">
        <div className="container-shell flex items-center justify-center gap-3"><span>{content.announcement}</span>{settings ? <CurrencySelector currencies={settings.currencies} selected={settings.currencyCode} label={locale === "ar" ? "العملة" : "Currency"} /> : null}</div>
      </div>
      <div className="bg-brand text-white">
        <div className="container-shell flex min-h-20 items-center gap-2 sm:gap-4">
          <MobileNavigation categories={tree} locale={locale} />
          <Link href={localePath(locale)} className="relative h-16 w-24 shrink-0 sm:w-32" aria-label={locale === "ar" ? "النجوم تيليكوم — الرئيسية" : "Alnjoom Telecom — Home"}><Image src="/alnjoom-logo.png" alt="النجوم تيليكوم | Alnjoom Telecom" fill priority sizes="128px" className="object-contain" /></Link>
          <form action={localePath(locale, "/search")} className="mx-auto hidden max-w-2xl flex-1 sm:flex" role="search">
            <label className="sr-only" htmlFor="header-search">{content.searchPlaceholder}</label>
            <input id="header-search" className="min-h-12 flex-1 rounded-s-lg border-0 bg-white px-4 text-ink outline-none" type="search" name="q" placeholder={content.searchPlaceholder} maxLength={180} />
            <button className="grid min-h-12 w-14 place-items-center rounded-e-lg bg-accent text-brand-strong" aria-label={locale === "ar" ? "بحث" : "Search"}><Search className="size-5" /></button>
          </form>
          <nav className="ms-auto flex items-center" aria-label={locale === "ar" ? "حساب وتسوق" : "Account and shopping"}>
            <Link className="grid size-11 place-items-center rounded-lg hover:bg-white/10 sm:hidden" href={localePath(locale, "/search")} aria-label={locale === "ar" ? "البحث" : "Search"}><Search className="size-5" /></Link>
            <Link className="grid size-11 place-items-center rounded-lg hover:bg-white/10" href={localePath(locale, "/account")} aria-label={locale === "ar" ? "الحساب" : "Account"}><UserRound className="size-5" /></Link>
            <Link className="hidden size-11 place-items-center rounded-lg hover:bg-white/10 md:grid" href={localePath(locale, "/account/wishlist")} aria-label={locale === "ar" ? "المفضلة" : "Wishlist"}><Heart className="size-5" /></Link>
            <NotificationBell locale={locale} />
            <CartTrigger locale={locale} />
            <LanguageSwitch locale={locale} />
          </nav>
        </div>
      </div>
      <div className="hidden border-b border-line bg-white lg:block">
        <nav className="container-shell" aria-label={locale === "ar" ? "الأقسام الرئيسية" : "Main categories"}>
          <ul className="flex min-h-12 items-center gap-1 overflow-x-auto">
            <li><Link className="block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold hover:bg-surface hover:text-brand" href={localePath(locale, "/products")}>{locale === "ar" ? "كل المنتجات" : "All products"}</Link></li>
            {tree.slice(0, 9).map((category) => <li key={category.id} className="group relative"><Link className="block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold hover:bg-surface hover:text-brand" href={localePath(locale, `/category/${category.slug}`)}>{localizedField({ ar: category.nameAr, en: category.nameEn, generic: category.name }, locale)}</Link>{category.children.length ? <div className="invisible absolute start-0 top-full z-40 min-w-56 translate-y-1 rounded-xl border border-line bg-white p-2 opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"><ul>{category.children.map((child) => <li key={child.id}><Link className="block rounded-lg px-3 py-2 text-sm hover:bg-surface hover:text-brand" href={localePath(locale, `/category/${child.slug}`)}>{localizedField({ ar: child.nameAr, en: child.nameEn, generic: child.name }, locale)}</Link></li>)}</ul></div> : null}</li>)}
          </ul>
        </nav>
      </div>
    </header>
  );
}
