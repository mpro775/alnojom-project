"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingCart, AlertTriangle, Loader2 } from "lucide-react";
import type { Cart, Locale } from "@/lib/api/contracts";
import { publicEndpoints, toStorefrontBff } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/error";
import { localePath } from "@/lib/i18n/locales";
import { writeCartId } from "./storage";

type RecoveryState =
  | { phase: "loading" }
  | { phase: "invalid"; reason: string }
  | { phase: "redirecting" };

const messages = {
  loading: { ar: "جارٍ استعادة سلتك…", en: "Restoring your cart…" },
  redirecting: { ar: "تم استعادة السلة! جارٍ التوجيه…", en: "Cart restored! Redirecting…" },
  missingParams: { ar: "رابط استعادة غير صالح. تأكد من الرابط المرسل في البريد.", en: "Invalid recovery link. Please check the link from your email." },
  cartNotFound: { ar: "السلة غير موجودة أو تم حذفها.", en: "Cart not found or has been deleted." },
  cartExpired: { ar: "رابط الاستعادة منتهي الصلاحية.", en: "Recovery link has expired." },
  cartEmpty: { ar: "السلة فارغة ولا يمكن استعادتها.", en: "Cart is empty and cannot be recovered." },
  unknownError: { ar: "حدث خطأ أثناء استعادة السلة. حاول مرة أخرى.", en: "An error occurred while restoring your cart. Please try again." },
  backToHome: { ar: "العودة للرئيسية", en: "Back to home" },
  browseProducts: { ar: "تصفح المنتجات", en: "Browse products" },
} as const;

export function RecoverCartPage({ locale }: { locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<RecoveryState>({ phase: "loading" });

  useEffect(() => {
    const cartId = searchParams.get("cartId")?.trim() ?? "";
    const recoveryToken = searchParams.get("recoveryToken")?.trim() ?? "";

    if (!cartId || !recoveryToken) {
      setState({ phase: "invalid", reason: "missingParams" });
      return;
    }

    let cancelled = false;

    async function recover() {
      try {
        // Validate the cart still exists and is usable
        const cart = await apiClient<Cart>(toStorefrontBff(publicEndpoints.cart(cartId)));

        if (cancelled) return;

        if (!cart.items || cart.items.length === 0) {
          setState({ phase: "invalid", reason: "cartEmpty" });
          return;
        }

        // Write the recovered cartId into localStorage so CartProvider picks it up
        writeCartId(window.localStorage, cart.cartId);

        setState({ phase: "redirecting" });

        // Short delay so the user sees the success message
        await new Promise((resolve) => setTimeout(resolve, 600));

        if (!cancelled) {
          router.replace(localePath(locale, "/checkout"));
        }
      } catch (error) {
        if (cancelled) return;

        if (error instanceof ApiError) {
          if (error.status === 404) {
            setState({ phase: "invalid", reason: "cartNotFound" });
          } else if (error.status === 400) {
            setState({ phase: "invalid", reason: "cartExpired" });
          } else {
            setState({ phase: "invalid", reason: "unknownError" });
          }
        } else {
          setState({ phase: "invalid", reason: "unknownError" });
        }
      }
    }

    void recover();
    return () => { cancelled = true; };
  }, [searchParams, router, locale]);

  return (
    <main id="main-content" className="container-shell section-space">
      <div className="mx-auto max-w-lg text-center">
        {state.phase === "loading" && (
          <div className="flex flex-col items-center gap-5 py-20">
            <Loader2 className="size-12 animate-spin text-brand" />
            <p className="text-lg font-bold">{messages.loading[locale]}</p>
          </div>
        )}

        {state.phase === "redirecting" && (
          <div className="flex flex-col items-center gap-5 py-20">
            <ShoppingCart className="size-12 text-success" />
            <p className="text-lg font-bold text-success">{messages.redirecting[locale]}</p>
          </div>
        )}

        {state.phase === "invalid" && (
          <div className="flex flex-col items-center gap-5 py-20">
            <AlertTriangle className="size-12 text-destructive" />
            <p className="text-lg font-bold">
              {messages[state.reason as keyof typeof messages]?.[locale] ?? messages.unknownError[locale]}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <a href={localePath(locale, "/")} className="btn btn-secondary">
                {messages.backToHome[locale]}
              </a>
              <a href={localePath(locale, "/products")} className="btn btn-primary">
                {messages.browseProducts[locale]}
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
