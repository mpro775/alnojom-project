"use client";

import Link from "next/link";
import { Languages } from "lucide-react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/api/contracts";
import { switchLocalePath } from "@/lib/i18n/locales";

export function LanguageSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const next = locale === "ar" ? "en" : "ar";
  return <Link href={switchLocalePath(pathname, next)} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-bold hover:bg-white/10" hrefLang={next}><Languages className="size-5" /><span className="hidden sm:inline">{next === "ar" ? "العربية" : "English"}</span></Link>;
}
