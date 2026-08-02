import { redirect } from "next/navigation";
import { isLocale, localePath } from "@/lib/i18n/locales";

export default async function DuplicateProductRoute({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  redirect(localePath(isLocale(locale) ? locale : "ar", `/product/${slug}`));
}
