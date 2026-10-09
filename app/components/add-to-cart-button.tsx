"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart, type CartItem } from "./cart-context";

type AddToCartButtonProps = {
  item: Omit<CartItem, "qty">;
  authenticated: boolean;
  disabled?: boolean;
};

export function AddToCartButton({
  item,
  authenticated,
  disabled = false,
}: AddToCartButtonProps) {
  const { items, hydrated, addItem } = useCart();
  const [message, setMessage] = useState<string | null>(null);
  const inCart = items.some((entry) => entry.id === item.id);
  const atStockLimit =
    item.type === "sale" &&
    (items.find((entry) => entry.id === item.id)?.qty ?? 0) >= (item.stock ?? 0);

  function handleAdd() {
    const error = addItem(item);
    setMessage(error ?? "Ditambahkan ke keranjang.");
  }

  return (
    <div className="space-y-2">
      {!authenticated ? (
        <Link
          href="/login"
          className="block w-full rounded-md bg-padel-blue px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700"
        >
          Masuk untuk tambah ke keranjang
        </Link>
      ) : (
      <button
        type="button"
        onClick={handleAdd}
        disabled={
          !hydrated ||
          disabled ||
          atStockLimit ||
          (item.type === "rent" && inCart)
        }
        className="w-full rounded-md bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600"
      >
        {!hydrated
          ? "Memuat..."
          : disabled
          ? "Tidak tersedia"
          : atStockLimit || (item.type === "rent" && inCart)
            ? "Sudah di keranjang"
            : "Tambah ke keranjang"}
      </button>
      )}
      {message && (
        <p aria-live="polite" className="text-xs text-zinc-600">
          {message}
        </p>
      )}
    </div>
  );
}
