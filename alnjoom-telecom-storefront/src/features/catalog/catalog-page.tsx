import type { Locale, ProductList, SmartFilter, StoreConfig } from "@/lib/api/contracts";
import type { SearchRecord } from "@/lib/api/storefront";
import { ProductGrid } from "@/components/product/product-grid";
import { CatalogFilters } from "./catalog-filters";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";

export function CatalogPage({ locale, title, description, result, filters, config, searchParams, error = false }: { locale: Locale; title: string; description?: string; result: ProductList; filters: SmartFilter[]; config: StoreConfig | null; searchParams: SearchRecord; error?: boolean }) {
  const currency = config?.storeSettings.currencyCode ?? "YER";
  return (
    <main id="main-content" className="container-shell section-space">
      <header className="mb-8"><h1 className="text-3xl font-black sm:text-4xl">{title}</h1>{description ? <p className="mt-3 max-w-3xl leading-8 text-muted">{description}</p> : null}<p className="mt-3 text-sm text-muted">{locale === "ar" ? `${result.total} منتج` : `${result.total} products`}</p></header>
      {error ? <Alert tone="error" className="mb-5">{locale === "ar" ? "تعذّر تحميل المنتجات من المتجر. حاول مرة أخرى." : "Products could not be loaded from the store. Try again."}</Alert> : null}
      <div className="grid gap-7 lg:grid-cols-[16rem_1fr]">
        <CatalogFilters filters={filters} locale={locale} />
        <section aria-label={locale === "ar" ? "نتائج المنتجات" : "Product results"}>
          {result.items.length ? <ProductGrid products={result.items} locale={locale} currency={currency} /> : <EmptyState title={locale === "ar" ? "لا توجد منتجات مطابقة" : "No matching products"} description={locale === "ar" ? "غيّر البحث أو الفلاتر ثم أعد المحاولة." : "Adjust your search or filters and try again."} />}
          <Pagination page={result.page} total={result.total} limit={result.limit} locale={locale} searchParams={searchParams} />
        </section>
      </div>
    </main>
  );
}
