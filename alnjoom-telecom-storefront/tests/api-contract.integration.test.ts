import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api/client";
import { customerEndpoints, publicEndpoints, toCustomerBff, toStorefrontBff } from "@/lib/api/endpoints";
import type { Cart, CheckoutQuote, CheckoutResult, LoyaltyWallet, PaymentMethod, ProductDetails, ProductList, WishlistItem } from "@/lib/api/contracts";

afterEach(() => vi.unstubAllGlobals());

describe("interactive contract integrations", () => {
  it.each([
    [toStorefrontBff(publicEndpoints.products), { items: [], total: 0, page: 1, limit: 20 } satisfies ProductList],
    [toStorefrontBff(publicEndpoints.product("phone")), { id: "p", variants: [], images: [] } as unknown as ProductDetails],
    [toStorefrontBff(publicEndpoints.cart("11111111-1111-4111-8111-111111111111")), { cartId: "11111111-1111-4111-8111-111111111111", items: [], totalItems: 0, subtotal: 0, subtotalYER: 0, currencyCode: "YER", exchangeRateYerPerUnit: 1 } satisfies Cart],
    [toStorefrontBff(publicEndpoints.checkoutQuote), { total: 10 } as CheckoutQuote],
    [toStorefrontBff(publicEndpoints.checkout), { orderId: "o", orderCode: "A-1" } as CheckoutResult],
    [toStorefrontBff(publicEndpoints.paymentMethods), [] satisfies PaymentMethod[]],
    [toCustomerBff(customerEndpoints.wishlist), [] satisfies WishlistItem[]],
    [toCustomerBff(customerEndpoints.loyaltyWallet), { customerId: "c", availablePoints: 10, lockedPoints: 0, lifetimeEarnedPoints: 10, lifetimeRedeemedPoints: 0 } satisfies LoyaltyWallet],
  ])("consumes %s through the same-origin typed client", async (path, payload) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(payload), { status: 200, headers: { "Content-Type": "application/json" } })));
    await expect(apiClient(path)).resolves.toEqual(payload);
  });

  it("surfaces checkout errors instead of replacing them", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: "LOYALTY_INSUFFICIENT_POINTS", message: "Insufficient loyalty points" }), { status: 400 })));
    await expect(apiClient(toStorefrontBff(publicEndpoints.checkoutQuote), { method: "POST", body: "{}" })).rejects.toMatchObject({ code: "LOYALTY_INSUFFICIENT_POINTS", message: "Insufficient loyalty points" });
  });
});
