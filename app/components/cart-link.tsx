"use client";

import Link from "next/link";
import { useCart } from "./cart-context";

export function CartLink() {
  const { items, hydrated } = useCart();
  const quantity = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <Link href="/cart" className="text-zinc-700 hover:text-emerald-800">
      Keranjang{hydrated && quantity > 0 ? ` (${quantity})` : ""}
    </Link>
  );
}
