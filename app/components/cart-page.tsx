"use client";

import { useCart } from "./cart-context";
import { formatRupiah } from "@/lib/format";
import { Badge, Card, CheckoutSteps, EmptyState, LinkButton } from "./ui";


export function CartPage() {
  const { items, hydrated, persistenceError, setQuantity, removeItem } =
    useCart();
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (!hydrated) {
    return <p className="py-10 text-sm text-zinc-600">Memuat keranjang...</p>;
  }

  return (
    <section className="py-8">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-padel-navy">Keranjang</h1>
      <CheckoutSteps current={1} />
      {persistenceError && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
        >
          {persistenceError}
        </p>
      )}
      {items.length === 0 ? (
        <EmptyState title="Keranjang masih kosong."><LinkButton href="/products" variant="secondary">Jelajahi produk</LinkButton></EmptyState>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white px-5 shadow-sm">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 py-5"
              >
                <div className="min-w-48 flex-1">
                  <h2 className="font-semibold text-zinc-950">{item.name}</h2>
                  <p className="mt-1 text-sm text-zinc-600">
                    {item.type === "rent" ? `Sewa ${item.qty} jam` : "Produk"}
                  </p>
                  <p className="mt-2 text-sm font-medium text-padel-navy">
                    {formatRupiah(item.price)}
                    {item.type === "rent" ? " / jam" : ""}
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
                        className="h-10 w-20 rounded-lg border border-zinc-300 px-2 text-zinc-950 focus:border-padel-blue focus:outline-none focus:ring-2 focus:ring-padel-blue/20"
                      />
                    </label>
                  ) : (
                    <label className="flex items-center gap-2 text-sm text-zinc-600">
                      Durasi (jam)
                      <input
                        type="number"
                        min={1}
                        max={24}
                        value={item.qty}
                        onChange={(event) => setQuantity(item.id, Number(event.target.value))}
                        className="h-10 w-20 rounded-lg border border-zinc-300 px-2 text-zinc-950 focus:border-padel-blue focus:outline-none focus:ring-2 focus:ring-padel-blue/20"
                      />
                    </label>
                  )}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="min-h-10 rounded-lg px-3 text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <Card className="h-fit p-5 lg:sticky lg:top-24">
            <Badge variant="info">Ringkasan</Badge>
            <div className="flex justify-between gap-4 text-lg font-semibold">
              <span>Perkiraan total</span>
              <span>{formatRupiah(total)}</span>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Total akhir dihitung ulang saat checkout.
            </p>
            <LinkButton href="/checkout" className="mt-5 w-full">Lanjut ke checkout</LinkButton>
          </Card>
          </div>
        </>
      )}
    </section>
  );
}
