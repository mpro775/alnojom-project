import Link from "next/link";
import type { Category, Locale } from "@/lib/api/contracts";
import { localizedField } from "@/lib/i18n/fields";
import { localePath } from "@/lib/i18n/locales";
import { MediaImage } from "@/components/ui/media-image";

export function CategoryTile({ category, locale }: { category: Category; locale: Locale }) {
  const name = localizedField({ ar: category.nameAr, en: category.nameEn, generic: category.name }, locale);
  const alt = localizedField({ ar: category.imageAltAr, en: category.imageAltEn, generic: name }, locale);
  return (
    <Link href={localePath(locale, `/category/${category.slug}`)} className="group relative min-h-44 overflow-hidden rounded-xl border border-line bg-surface">
      <MediaImage src={category.backgroundImageUrl ?? category.imageUrl} alt={alt} sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition duration-300 group-hover:scale-105" />
      <span className="absolute inset-0 bg-gradient-to-t from-brand-strong/85 via-brand/15 to-transparent" aria-hidden="true" />
      <strong className="absolute inset-x-4 bottom-4 text-base text-white sm:text-lg">{name}</strong>
    </Link>
  );
}
