import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductPage } from "@/features/product/product-page";
import { getCategoriesSafe, getProduct, getProductQuestionsSafe, getProductReviewsSafe, getProductsSafe, getStoreConfigSafe } from "@/lib/api/storefront";
import { ApiError } from "@/lib/api/error";
import { isLocale } from "@/lib/i18n/locales";
import { productMetadata, safeJsonLd } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  try {
    const [product, config] = await Promise.all([getProduct(slug), getStoreConfigSafe()]);
    return productMetadata(config, product, raw);
  } catch {
    return { robots: { index: false, follow: false } };
  }
}

export default async function ProductRoute({ params }: Props) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  let product;
  try {
    product = await getProduct(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const [config, categories, reviews, questions, related] = await Promise.all([
    getStoreConfigSafe(),
    getCategoriesSafe(),
    getProductReviewsSafe(product.id),
    product.questionsEnabled ? getProductQuestionsSafe(product.id) : Promise.resolve({ items: [], total: 0 }),
    product.categoryId ? getProductsSafe({ categoryId: product.categoryId, limit: "5" }) : Promise.resolve({ items: [], total: 0, page: 1, limit: 5 }),
  ]);
  const category = categories.find((item) => item.id === product.categoryId) ?? null;
  const selected = product.variants.find((variant) => variant.isDefault) ?? (product.variants.length === 1 ? product.variants[0] : null);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: raw === "ar" ? product.titleAr ?? product.title : product.titleEn ?? product.title,
    image: product.images.map((image) => image.url),
    description: raw === "ar" ? product.shortDescriptionAr ?? product.descriptionAr ?? product.description : product.shortDescriptionEn ?? product.descriptionEn ?? product.description,
    sku: selected?.sku,
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(selected ? { offers: { "@type": "Offer", price: selected.price, priceCurrency: config?.storeSettings.currencyCode ?? "YER", availability: product.stockUnlimited || selected.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" } } : {}),
    ...(product.ratingCount > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.ratingAvg, reviewCount: product.ratingCount } } : {}),
  };
  return <><ProductPage locale={raw} product={product} config={config} category={category} reviews={reviews} questions={questions} related={related} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} /></>;
}
