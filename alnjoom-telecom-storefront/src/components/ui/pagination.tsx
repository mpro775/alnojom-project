import Link from "next/link";
import type { Locale } from "@/lib/api/contracts";

export function Pagination({ page, total, limit, locale, searchParams }: { page: number; total: number; limit: number; locale: Locale; searchParams: Record<string, string | string[] | undefined> }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  const href = (nextPage: number) => {
    const params = new URLSearchParams();
    for (const [key, raw] of Object.entries(searchParams)) {
      for (const value of Array.isArray(raw) ? raw : raw ? [raw] : []) params.append(key, value);
    }
    params.set("page", String(nextPage));
    return `?${params.toString()}`;
  };
  return (
    <nav className="mt-10 flex items-center justify-center gap-3" aria-label={locale === "ar" ? "صفحات النتائج" : "Results pages"}>
      <Link aria-disabled={page <= 1} tabIndex={page <= 1 ? -1 : undefined} className={button(page <= 1)} href={href(Math.max(1, page - 1))}>{locale === "ar" ? "السابق" : "Previous"}</Link>
      <span className="text-sm text-muted">{page} / {pages}</span>
      <Link aria-disabled={page >= pages} tabIndex={page >= pages ? -1 : undefined} className={button(page >= pages)} href={href(Math.min(pages, page + 1))}>{locale === "ar" ? "التالي" : "Next"}</Link>
    </nav>
  );
}

function button(disabled: boolean) {
  return `inline-flex min-h-11 items-center rounded-lg border border-line px-4 text-sm font-bold ${disabled ? "pointer-events-none opacity-45" : "hover:border-brand hover:text-brand"}`;
}
