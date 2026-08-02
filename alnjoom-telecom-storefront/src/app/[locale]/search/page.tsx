import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { CatalogPage } from "@/features/catalog/catalog-page";
import { getFiltersSafe, getProducts, getStoreConfigSafe, type SearchRecord } from "@/lib/api/storefront";
import { isLocale, localePath } from "@/lib/i18n/locales";

export const metadata: Metadata = { title: "البحث", robots: { index: false, follow: true } };

export default async function SearchPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<SearchRecord> }) {
  const [{ locale: raw }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(raw)) notFound();
  const term = typeof query.q === "string" ? query.q.trim() : "";
  const [catalog, filters, config] = await Promise.all([
    term
      ? getProducts({ ...query, q: term, limit: query.limit ?? "20" }).then(
          (result) => ({ result, error: false }),
          () => ({ result: { items: [], total: 0, page: 1, limit: 20 }, error: true }),
        )
      : Promise.resolve({ result: { items: [], total: 0, page: 1, limit: 20 }, error: false }),
    getFiltersSafe(),
    getStoreConfigSafe(),
  ]);
  return (
    <>
      <section className="border-b border-line bg-surface py-7"><form role="search" action={localePath(raw, "/search")} className="container-shell flex max-w-3xl"><label className="sr-only" htmlFor="search-page-input">{raw === "ar" ? "ابحث" : "Search"}</label><input id="search-page-input" className="field rounded-e-none" type="search" name="q" defaultValue={term} maxLength={180} placeholder={raw === "ar" ? "ما الذي تبحث عنه؟" : "What are you looking for?"} /><button className="grid w-14 place-items-center rounded-e-lg bg-brand text-white" aria-label={raw === "ar" ? "بحث" : "Search"}><Search className="size-5" /></button></form></section>
      <CatalogPage locale={raw} title={term ? (raw === "ar" ? `نتائج البحث عن «${term}»` : `Results for “${term}”`) : raw === "ar" ? "البحث" : "Search"} result={catalog.result} filters={filters} config={config} searchParams={query} error={catalog.error} />
    </>
  );
}
