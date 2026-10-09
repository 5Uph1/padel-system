"use client";

import Link from "next/link";
import { useActionState } from "react";
import { checkout } from "@/app/checkout/actions";
import { useCart } from "./cart-context";

export function CheckoutForm() {
  const { items, hydrated } = useCart();
  const [error, formAction, pending] = useActionState(checkout, null);
  const serializedItems = JSON.stringify(
    items.map((item) => ({ id: item.id, qty: item.qty })),
  );

  if (!hydrated) {
    return <p className="mt-8 text-sm text-zinc-600">Memuat keranjang...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-md border border-zinc-200 p-5">
        <p className="text-sm text-zinc-600">
          Keranjang kosong. Tambahkan item sebelum checkout.
        </p>
        <Link
          href="/products"
          className="mt-3 inline-block text-sm font-semibold text-emerald-800"
        >
          Lihat produk
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8">
      <input type="hidden" name="items" value={serializedItems} />
      <div className="rounded-lg border border-zinc-200 p-5">
        <h2 className="font-semibold text-zinc-950">Ringkasan pesanan</h2>
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex justify-between gap-4 text-sm text-zinc-700"
            >
              <span>
                {item.name} × {item.qty}
                {item.type === "rent" ? " (per hari)" : ""}
              </span>
              <span>Rp{(item.price * item.qty).toLocaleString("id-ID")}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 border-t border-zinc-200 pt-4 text-sm text-zinc-600">
          Stok produk akan dikurangi dan item sewa akan ditandai disewa setelah
          pesanan berhasil dibuat.
        </p>
      </div>
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800"
        >
          Checkout gagal: {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-5 w-full rounded-md bg-emerald-800 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Memproses..." : "Buat pesanan"}
      </button>
    </form>
  );
}
