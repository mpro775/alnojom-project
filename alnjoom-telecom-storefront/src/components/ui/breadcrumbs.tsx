import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Locale } from "@/lib/api/contracts";

export function Breadcrumbs({ locale, items }: { locale: Locale; items: Array<{ label: string; href?: string }> }) {
  const Icon = locale === "ar" ? ChevronLeft : ChevronRight;
  return (
    <nav aria-label={locale === "ar" ? "مسار التنقل" : "Breadcrumb"} className="mb-6 overflow-x-auto text-sm text-muted">
      <ol className="flex min-w-max items-center gap-1.5">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 ? <Icon className="size-4" aria-hidden="true" /> : null}
            {item.href ? <Link className="hover:text-brand" href={item.href}>{item.label}</Link> : <span aria-current="page" className="text-ink">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
