import type { Category, Locale, ProductDetails, ProductList, ProductQuestion, ProductReviews, StoreConfig } from "@/lib/api/contracts";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { localePath } from "@/lib/i18n/locales";
import { localizedField } from "@/lib/i18n/fields";
import { formatDate } from "@/lib/format/commerce";
import { safeYoutubeEmbed } from "@/lib/images/media";
import { ProductDetailsInteractive } from "./product-details-interactive";
import { ReviewForm, QuestionForm, PaginatedReviews, PaginatedQuestions } from "./engagement";
import { ProductGrid } from "@/components/product/product-grid";

export function ProductPage({ locale, product, config, category, reviews, questions, related }: { locale: Locale; product: ProductDetails; config: StoreConfig | null; category: Category | null; reviews: ProductReviews; questions: { items: ProductQuestion[]; total: number }; related: ProductList }) {
  const title = localizedField({ ar: product.titleAr, en: product.titleEn, generic: product.title }, locale);
  const description = localizedField({ ar: product.detailedDescriptionAr ?? product.descriptionAr, en: product.detailedDescriptionEn ?? product.descriptionEn, generic: product.description }, locale);
  const shortDescription = localizedField({ ar: product.shortDescriptionAr, en: product.shortDescriptionEn, generic: product.description }, locale);
  const currency = config?.storeSettings.currencyCode ?? "";
  const youtube = safeYoutubeEmbed(product.youtubeUrl);
  const sharedAttributes = product.variants[0] ? Object.entries(product.variants[0].attributes).filter(([key, value]) => product.variants.every((v) => v.attributes[key] === value)) : [];
  const specs = [
    ...(product.brand ? [[locale === "ar" ? "العلامة" : "Brand", product.brand]] : []),
    ...(product.weight !== null ? [[locale === "ar" ? "الوزن" : "Weight", `${product.weight} ${product.weightUnit ?? ""}`.trim()]] : []),
    ...sharedAttributes,
  ];
  return (
    <main id="main-content" className="container-shell section-space">
      <Breadcrumbs locale={locale} items={[{ label: locale === "ar" ? "الرئيسية" : "Home", href: localePath(locale) }, ...(category ? [{ label: localizedField({ ar: category.nameAr, en: category.nameEn, generic: category.name }, locale), href: localePath(locale, `/category/${category.slug}`) }] : []), { label: title }]} />
      <ProductDetailsInteractive product={product} locale={locale} currency={currency} />
      {shortDescription ? <section className="mt-12 border-t border-line pt-9"><h2 className="text-2xl font-black">{locale === "ar" ? "عن المنتج" : "About this product"}</h2><p className="mt-4 max-w-4xl whitespace-pre-wrap leading-8 text-muted">{shortDescription}</p></section> : null}
      <div className="mt-12 grid gap-8 border-t border-line pt-9 lg:grid-cols-2">
        <section><h2 className="text-2xl font-black">{locale === "ar" ? "التفاصيل والمواصفات" : "Details and specifications"}</h2>{description ? <p className="mt-4 whitespace-pre-wrap leading-8 text-muted">{description}</p> : null}{specs.length ? <dl className="mt-6 divide-y divide-line rounded-xl border border-line">{specs.map(([name, value]) => <div key={name} className="grid grid-cols-2 gap-3 p-3 text-sm"><dt className="text-muted">{name}</dt><dd className="font-bold">{value}</dd></div>)}</dl> : null}</section>
        {youtube ? <section><h2 className="mb-4 text-2xl font-black">{locale === "ar" ? "فيديو المنتج" : "Product video"}</h2><div className="aspect-video overflow-hidden rounded-xl bg-black"><iframe className="size-full" src={youtube} title={title} loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div></section> : null}
      </div>
      <section id="reviews" className="mt-12 border-t border-line pt-9"><h2 className="text-2xl font-black">{locale === "ar" ? "تقييمات العملاء" : "Customer reviews"}</h2><div className="mt-5 grid gap-7 lg:grid-cols-[18rem_1fr]"><div className="surface-card p-5"><strong className="text-4xl text-brand">{reviews.stats.averageRating.toFixed(1)}</strong><p className="mt-1 text-sm text-muted">{reviews.stats.totalReviews} {locale === "ar" ? "تقييم" : "reviews"}</p><div className="mt-4 space-y-2">{[5,4,3,2,1].map((rating) => { const count = reviews.stats.ratingDistribution.find((item) => item.rating === rating)?.count ?? 0; const percent = reviews.stats.totalReviews ? Math.round((count / reviews.stats.totalReviews) * 100) : 0; return <div key={rating} className="grid grid-cols-[2rem_1fr_2rem] items-center gap-2 text-xs"><span>{rating}★</span><span className="h-2 overflow-hidden rounded-full bg-surface"><span className="block h-full bg-accent" style={{ width: `${percent}%` }} /></span><span>{count}</span></div>; })}</div><ReviewForm productId={product.id} locale={locale} /></div><PaginatedReviews productId={product.id} locale={locale} initialReviews={reviews.reviews} totalCount={reviews.stats.totalReviews} /></div></section>
      {product.questionsEnabled ? <section className="mt-12 border-t border-line pt-9"><h2 className="text-2xl font-black">{locale === "ar" ? "الأسئلة والأجوبة" : "Questions and answers"}</h2><div className="mt-5 grid gap-7 lg:grid-cols-[1fr_20rem]"><PaginatedQuestions productId={product.id} locale={locale} initialQuestions={questions.items} totalCount={questions.total} /><QuestionForm productId={product.id} locale={locale} /></div></section> : null}
      {related.items.length ? <section className="mt-12 border-t border-line pt-9"><h2 className="mb-6 text-2xl font-black">{locale === "ar" ? "من القسم نفسه" : "From the same category"}</h2><ProductGrid products={related.items.filter((item) => item.id !== product.id).slice(0, 4)} locale={locale} currency={currency} /></section> : null}
    </main>
  );
}
