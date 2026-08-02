import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CatalogPage } from "@/features/catalog/catalog-page";
import { getFiltersSafe, getProducts, getStoreConfigSafe, type SearchRecord } from "@/lib/api/storefront";
import { isLocale } from "@/lib/i18n/locales";

export const metadata: Metadata = { title: "المنتجات", robots: { index: true, follow: true } };

export default async function ProductsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<SearchRecord> }) {
  const [{ locale: raw }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(raw)) notFound();
  const [catalog, filters, config] = await Promise.all([
    getProducts({ ...query, limit: query.limit ?? "20" }).then(
      (result) => ({ result, error: false }),
      () => ({ result: { items: [], total: 0, page: 1, limit: 20 }, error: true }),
    ),
    getFiltersSafe(),
    getStoreConfigSafe(),
  ]);
  return <CatalogPage locale={raw} title={raw === "ar" ? "كل المنتجات" : "All products"} result={catalog.result} filters={filters} config={config} searchParams={query} error={catalog.error} />;
}
