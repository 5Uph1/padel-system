"use client";

import { useState } from "react";
import { useCart, type CartItem } from "./cart-context";
import { Button, LinkButton } from "./ui";

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
        <LinkButton href="/login" className="w-full">
          Masuk untuk tambah ke keranjang
        </LinkButton>
      ) : (
      <Button
        type="button"
        onClick={handleAdd}
        disabled={
          !hydrated ||
          disabled ||
          atStockLimit ||
          (item.type === "rent" && inCart)
        }
        className="w-full"
      >
        {!hydrated
          ? "Memuat..."
          : disabled
          ? "Tidak tersedia"
          : atStockLimit || (item.type === "rent" && inCart)
            ? "Sudah di keranjang"
            : "Tambah ke keranjang"}
      </Button>
      )}
      {message && (
        <p aria-live="polite" className="text-xs text-zinc-600">
          {message}
        </p>
      )}
    </div>
  );
}
