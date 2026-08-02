import { notFound } from "next/navigation";
import { HomePage } from "@/features/home/home-page";
import { getCategoriesSafe, getProductsSafe, getStoreConfigSafe } from "@/lib/api/storefront";
import { isLocale } from "@/lib/i18n/locales";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const [config, categories, featured, latest] = await Promise.all([
    getStoreConfigSafe(),
    getCategoriesSafe(),
    getProductsSafe({ isFeatured: "true", limit: "8" }),
    getProductsSafe({ limit: "8" }),
  ]);
  return <HomePage locale={raw} config={config} categories={categories} featured={featured} latest={latest} />;
}
