"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import type { Locale } from "@/lib/api/contracts";
import { apiClient } from "@/lib/api/client";
import { customerEndpoints, toCustomerBff } from "@/lib/api/endpoints";
import { localePath } from "@/lib/i18n/locales";

export function NotificationBell({ locale }: { locale: Locale }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    apiClient<{ count: number }>(toCustomerBff(customerEndpoints.notificationCount))
      .then((value) => setCount(value.count))
      .catch(() => setCount(0));
  }, []);
  return <Link href={localePath(locale, "/account/notifications")} className="relative grid size-11 place-items-center rounded-lg hover:bg-white/10" aria-label={locale === "ar" ? "الإشعارات" : "Notifications"}><Bell className="size-5" />{count > 0 ? <span className="absolute -end-1 -top-1 min-w-5 rounded-full bg-accent px-1 text-center text-[11px] font-bold text-brand-strong">{Math.min(count, 99)}</span> : null}</Link>;
}
