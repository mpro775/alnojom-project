import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CatalogPage } from "@/features/catalog/catalog-page";
import { getCategories, getFiltersSafe, getProducts, getStoreConfigSafe, type SearchRecord } from "@/lib/api/storefront";
import { localizedField } from "@/lib/i18n/fields";
import { isLocale } from "@/lib/i18n/locales";
import { categoryMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: string; slug: string }>; searchParams: Promise<SearchRecord> };

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  const [categories, config] = await Promise.all([getCategories().catch(() => []), getStoreConfigSafe()]);
  const category = categories.find((item) => item.slug === slug);
  return category ? categoryMetadata(config, category, raw) : { robots: { index: false, follow: false } };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ locale: raw, slug }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(raw)) notFound();
  const [categories, config] = await Promise.all([getCategories().catch(() => []), getStoreConfigSafe()]);
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const [catalog, filters] = await Promise.all([
    getProducts({ ...query, categorySlug: slug, limit: query.limit ?? "20" }).then(
      (result) => ({ result, error: false }),
      () => ({ result: { items: [], total: 0, page: 1, limit: 20 }, error: true }),
    ),
    getFiltersSafe({ categoryId: category.id }),
  ]);
  return <CatalogPage locale={raw} title={localizedField({ ar: category.nameAr, en: category.nameEn, generic: category.name }, raw)} description={localizedField({ ar: category.descriptionAr, en: category.descriptionEn, generic: category.description }, raw)} result={catalog.result} filters={filters} config={config} searchParams={query} error={catalog.error} />;
}
