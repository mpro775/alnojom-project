"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Cart } from "@/lib/api/contracts";
import { publicEndpoints, toStorefrontBff } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/error";
import { readCartId, writeCartId } from "./storage";

interface CartApi {
  cart: Cart | null;
  loading: boolean;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addItem: (variantId: string, quantity: number, currencyCode?: string) => Promise<Cart>;
  updateItem: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refresh = useCallback(async () => {
    const cartId = readCartId(typeof window === "undefined" ? null : window.localStorage);
    if (!cartId) {
      setCart(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setCart(await apiClient<Cart>(toStorefrontBff(publicEndpoints.cart(cartId))));
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
        writeCartId(window.localStorage, null);
        setCart(null);
      } else {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh().catch(() => setLoading(false)), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const addItem = useCallback(async (variantId: string, quantity: number, currencyCode?: string) => {
    const cartId = readCartId(window.localStorage);
    const payload = {
      ...(cartId ? { cartId } : {}),
      variantId,
      quantity,
      ...(currencyCode ? { currencyCode } : {}),
    };
    const next = await apiClient<Cart>(toStorefrontBff(publicEndpoints.cartItems), {
      method: "POST",
      body: JSON.stringify(payload),
    });
    writeCartId(window.localStorage, next.cartId);
    setCart(next);
    setDrawerOpen(true);
    return next;
  }, []);

  const updateItem = useCallback(async (variantId: string, quantity: number) => {
    if (!cart) return;
    const next = await apiClient<Cart>(toStorefrontBff(publicEndpoints.cartItem(cart.cartId, variantId)), {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
    setCart(next);
  }, [cart]);

  const removeItem = useCallback(async (variantId: string) => {
    if (!cart) return;
    const next = await apiClient<Cart>(toStorefrontBff(publicEndpoints.cartItem(cart.cartId, variantId)), { method: "DELETE" });
    setCart(next);
  }, [cart]);

  const value = useMemo(() => ({ cart, loading, drawerOpen, setDrawerOpen, addItem, updateItem, removeItem, refresh }), [cart, loading, drawerOpen, addItem, updateItem, removeItem, refresh]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
