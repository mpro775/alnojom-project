"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { Locale } from "@/lib/api/contracts";
import type { CategoryNode } from "@/features/catalog/category-tree";
import { localizedField } from "@/lib/i18n/fields";
import { localePath } from "@/lib/i18n/locales";

export function MobileNavigation({ categories, locale }: { categories: CategoryNode[]; locale: Locale }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="grid size-11 place-items-center rounded-lg lg:hidden" aria-label={locale === "ar" ? "فتح القائمة" : "Open menu"}><Menu className="size-6" /></Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45" />
        <Dialog.Content className="fixed inset-y-0 start-0 z-50 w-[min(90vw,23rem)] overflow-y-auto bg-white p-5 text-ink shadow-2xl">
          <div className="mb-5 flex items-center justify-between"><Dialog.Title className="font-bold">{locale === "ar" ? "القائمة" : "Menu"}</Dialog.Title><Dialog.Close className="grid size-11 place-items-center rounded-lg hover:bg-surface"><X className="size-5" /></Dialog.Close></div>
          <nav aria-label={locale === "ar" ? "التنقل للجوال" : "Mobile navigation"}>
            <ul className="divide-y divide-line">
              <li><Dialog.Close asChild><Link className="block py-3 font-bold" href={localePath(locale, "/products")}>{locale === "ar" ? "جميع المنتجات" : "All products"}</Link></Dialog.Close></li>
              {categories.map((category) => <li key={category.id} className="py-3"><Dialog.Close asChild><Link className="font-bold" href={localePath(locale, `/category/${category.slug}`)}>{localizedField({ ar: category.nameAr, en: category.nameEn, generic: category.name }, locale)}</Link></Dialog.Close>{category.children.length ? <ul className="mt-2 space-y-2 ps-3 text-sm text-muted">{category.children.map((child) => <li key={child.id}><Dialog.Close asChild><Link href={localePath(locale, `/category/${child.slug}`)}>{localizedField({ ar: child.nameAr, en: child.nameEn, generic: child.name }, locale)}</Link></Dialog.Close></li>)}</ul> : null}</li>)}
            </ul>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
