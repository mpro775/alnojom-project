"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import type { Locale } from "@/lib/api/contracts";
import { apiClient } from "@/lib/api/client";
import { ApiError, userSafeError } from "@/lib/api/error";
import { customerEndpoints, toCustomerBff } from "@/lib/api/endpoints";
import { localePath } from "@/lib/i18n/locales";
import { useToast } from "@/components/ui/toast";

export function WishlistButton({ productId, locale, className = "" }: { productId: string; locale: Locale; className?: string }) {
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { show } = useToast();

  async function toggle() {
    if (busy) return;
    const previous = active;
    setActive(!previous);
    setBusy(true);
    try {
      await apiClient(toCustomerBff(customerEndpoints.wishlistProduct(productId)), {
        method: previous ? "DELETE" : "POST",
      });
      show(
        previous
          ? locale === "ar" ? "أزيل المنتج من المفضلة" : "Removed from wishlist"
          : locale === "ar" ? "أضيف المنتج إلى المفضلة" : "Added to wishlist",
        "success",
      );
    } catch (error) {
      setActive(previous);
      if (error instanceof ApiError && error.status === 401) {
        router.push(`${localePath(locale, "/login")}?returnTo=${encodeURIComponent(pathname)}`);
        return;
      }
      show(userSafeError(error, locale), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={toggle} disabled={busy} aria-pressed={active} aria-label={locale === "ar" ? "إضافة إلى المفضلة" : "Add to wishlist"} className={`grid size-11 place-items-center rounded-full border border-line bg-white text-brand shadow-sm hover:border-brand ${className}`}>
      <Heart className={`size-5 ${active ? "fill-brand" : ""}`} />
    </button>
  );
}
