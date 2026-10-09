"use client";

import { useState } from "react";
import { useCart, type CartItem } from "./cart-context";
import { Button, LinkButton } from "./ui";
import { formatRupiah } from "@/lib/format";

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
  const [rentalHours, setRentalHours] = useState(1);
  const inCart = items.some((entry) => entry.id === item.id);
  const atStockLimit =
    item.type === "sale" &&
    (items.find((entry) => entry.id === item.id)?.qty ?? 0) >= (item.stock ?? 0);

  function handleAdd() {
    const error = addItem(item, rentalHours);
    setMessage(error ?? "Ditambahkan ke keranjang.");
  }

  return (
    <div className="space-y-2">
      {!authenticated ? (
        <LinkButton href="/login" className="w-full">
          Masuk untuk tambah ke keranjang
        </LinkButton>
      ) : (
      <>
      {item.type === "rent" && (
        <label className="block text-sm font-medium text-zinc-700">
          Durasi sewa (jam)
          <select
            value={rentalHours}
            onChange={(event) => setRentalHours(Number(event.target.value))}
            disabled={!hydrated || inCart || disabled}
            className="mt-2 block min-h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-padel-blue focus:outline-none focus:ring-2 focus:ring-padel-blue/20 disabled:bg-zinc-100"
          >
            {Array.from({ length: 24 }, (_, index) => index + 1).map((hours) => (
              <option key={hours} value={hours}>{hours} jam · {formatRupiah(item.price * hours)}</option>
            ))}
          </select>
        </label>
      )}
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
      </>
      )}
      {message && (
        <p aria-live="polite" className="text-xs text-zinc-600">
          {message}
        </p>
      )}
    </div>
  );
}
