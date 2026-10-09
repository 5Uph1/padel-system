"use client";

import Link from "next/link";
import { useCart } from "./cart-context";

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function CartPage() {
  const { items, hydrated, persistenceError, setQuantity, removeItem } =
    useCart();
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (!hydrated) {
    return <p className="py-10 text-sm text-zinc-600">Memuat keranjang...</p>;
  }

  return (
    <section className="py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
        Keranjang
      </h1>
      {persistenceError && (
        <p
          role="alert"
          className="mt-5 rounded-md bg-amber-50 p-3 text-sm text-amber-900"
        >
          {persistenceError}
        </p>
      )}
      {items.length === 0 ? (
        <div className="mt-8 rounded-lg border border-zinc-200 p-6">
          <p className="text-zinc-600">Keranjang masih kosong.</p>
          <Link
            href="/products"
            className="mt-4 inline-block text-sm font-semibold text-emerald-800"
          >
            Jelajahi produk
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-8 divide-y divide-zinc-200 border-y border-zinc-200">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 py-5"
              >
                <div className="min-w-48 flex-1">
                  <h2 className="font-semibold text-zinc-950">{item.name}</h2>
                  <p className="mt-1 text-sm text-zinc-600">
                    {item.type === "rent" ? "Sewa per hari" : "Produk"}
                  </p>
                  <p className="mt-2 text-sm font-medium text-emerald-900">
                    {priceFormatter.format(item.price)}
                    {item.type === "rent" ? " / hari" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {item.type === "sale" ? (
                    <label className="flex items-center gap-2 text-sm text-zinc-600">
                      Jumlah
                      <input
                        type="number"
                        min={1}
                        max={item.stock ?? 1}
                        value={item.qty}
                        onChange={(event) =>
                          setQuantity(item.id, Number(event.target.value))
                        }
                        className="w-20 rounded-md border border-zinc-300 px-2 py-1.5 text-zinc-950"
                      />
                    </label>
                  ) : (
                    <span className="text-sm text-zinc-600">1 unit</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-sm font-medium text-red-700"
                  >
                    Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="ml-auto mt-6 max-w-sm">
            <div className="flex justify-between gap-4 text-lg font-semibold">
              <span>Perkiraan total</span>
              <span>{priceFormatter.format(total)}</span>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Total akhir dihitung ulang saat checkout.
            </p>
            <Link
              href="/checkout"
              className="mt-5 block rounded-md bg-emerald-800 px-4 py-3 text-center text-sm font-semibold text-white"
            >
              Lanjut ke checkout
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
