import type { Metadata } from "next";
import type { Category, Locale, ProductDetails, StoreConfig } from "@/lib/api/contracts";
import { localizedField } from "@/lib/i18n/fields";
import { localePath } from "@/lib/i18n/locales";

export function canonicalOrigin(config: StoreConfig | null): string {
  const candidate = config?.storeSettings.seoSettings.canonicalBaseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    return new URL(candidate).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export function localizedAlternates(config: StoreConfig | null, locale: Locale, path = "/") {
  const origin = canonicalOrigin(config);
  return {
    canonical: new URL(localePath(locale, path), origin).toString(),
    languages: {
      ar: new URL(localePath("ar", path), origin).toString(),
      en: new URL(localePath("en", path), origin).toString(),
      "x-default": new URL(localePath("ar", path), origin).toString(),
    },
  };
}

export function homeMetadata(config: StoreConfig | null, locale: Locale): Metadata {
  const settings = config?.storeSettings;
  const seo = settings?.seoSettings;
  const title = localizedField({ ar: seo?.homeSeoTitleAr, en: seo?.homeSeoTitleEn, generic: settings?.name }, locale) || (locale === "ar" ? "النجوم تيليكوم" : "Alnjoom Telecom");
  const description = localizedField({ ar: seo?.homeSeoDescriptionAr, en: seo?.homeSeoDescriptionEn, generic: settings?.description }, locale) || undefined;
  const image = seo?.defaultOgImage ?? undefined;
  return {
    title,
    description,
    keywords: seo?.keywords,
    alternates: localizedAlternates(config, locale),
    robots: { index: seo?.seoIndexEnabled ?? false, follow: seo?.seoFollowDefault ?? false },
    openGraph: { title, description, type: "website", url: localizedAlternates(config, locale).canonical, ...(image ? { images: [image] } : {}) },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, ...(seo?.defaultTwitterImage || image ? { images: [seo?.defaultTwitterImage ?? image!] } : {}) },
    verification: seo ? { google: seo.googleSiteVerification ?? undefined, other: { ...(seo.bingSiteVerification ? { "msvalidate.01": seo.bingSiteVerification } : {}), ...(seo.facebookDomainVerification ? { "facebook-domain-verification": seo.facebookDomainVerification } : {}) } } : undefined,
  };
}

export function productMetadata(config: StoreConfig | null, product: ProductDetails, locale: Locale): Metadata {
  const title = localizedField({ ar: product.seoTitleAr ?? product.titleAr, en: product.seoTitleEn ?? product.titleEn, generic: product.seoTitle ?? product.title }, locale);
  const description = localizedField({ ar: product.seoDescriptionAr ?? product.shortDescriptionAr, en: product.seoDescriptionEn ?? product.shortDescriptionEn, generic: product.seoDescription ?? product.description }, locale) || undefined;
  const path = `/product/${product.slug}`;
  const images = product.images.map((image) => image.url).slice(0, 4);
  return { title, description, alternates: localizedAlternates(config, locale, path), openGraph: { title, description, type: "website", images }, twitter: { card: images.length ? "summary_large_image" : "summary", title, description, images } };
}

export function categoryMetadata(config: StoreConfig | null, category: Category, locale: Locale): Metadata {
  const title = localizedField({ ar: category.seoTitleAr ?? category.nameAr, en: category.seoTitleEn ?? category.nameEn, generic: category.name }, locale);
  const description = localizedField({ ar: category.seoDescriptionAr ?? category.descriptionAr, en: category.seoDescriptionEn ?? category.descriptionEn, generic: category.description }, locale) || undefined;
  const path = `/category/${category.slug}`;
  return { title, description, alternates: localizedAlternates(config, locale, path), openGraph: { title, description, type: "website", ...(category.imageUrl ? { images: [category.imageUrl] } : {}) } };
}

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
