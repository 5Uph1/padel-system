"use client";

import { useEffect } from "react";
import { useCart } from "./cart-context";

export function CartClearOnMount() {
  const { clearCart, hydrated } = useCart();

  useEffect(() => {
    if (hydrated) clearCart();
  }, [clearCart, hydrated]);

  return null;
}
