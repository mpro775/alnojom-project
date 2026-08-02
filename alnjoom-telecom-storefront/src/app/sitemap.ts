import type { MetadataRoute } from "next";
import { getCategoriesSafe, getProductsSafe, getStoreConfigSafe } from "@/lib/api/storefront";
import { canonicalOrigin } from "@/lib/seo/metadata";
import { localePath } from "@/lib/i18n/locales";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [config, categories, first] = await Promise.all([getStoreConfigSafe(), getCategoriesSafe(), getProductsSafe({ page: "1", limit: "100" })]);
  const pages = Math.ceil(first.total / 100);
  const rest = pages > 1 ? await Promise.all(Array.from({ length: pages - 1 }, (_, index) => getProductsSafe({ page: String(index + 2), limit: "100" }))) : [];
  const products = [first, ...rest].flatMap((page) => page.items);
  const origin = canonicalOrigin(config);
  const entries: MetadataRoute.Sitemap = [];
  const add = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly") => {
    entries.push({ url: new URL(localePath("ar", path), origin).toString(), alternates: { languages: { ar: new URL(localePath("ar", path), origin).toString(), en: new URL(localePath("en", path), origin).toString() } }, priority, changeFrequency });
  };
  add("/", 1, "daily");
  add("/products", 0.9, "daily");
  ["/about", "/contact", "/shipping", "/payment"].forEach((path) => add(path, 0.4, "monthly"));
  categories.forEach((category) => add(`/category/${category.slug}`, 0.7, "weekly"));
  products.forEach((product) => add(`/product/${product.slug}`, 0.8, "weekly"));
  return entries;
}
