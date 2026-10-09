"use client";

import { useActionState } from "react";
import { checkout } from "@/app/checkout/actions";
import { useCart } from "./cart-context";
import { formatRupiah } from "@/lib/format";
import { Alert, Button, Card, CheckoutSteps, LinkButton } from "./ui";

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
      <div className="mt-8">
        <p className="text-sm text-zinc-600">
          Keranjang kosong. Tambahkan item sebelum checkout.
        </p>
        <LinkButton href="/products" variant="secondary" className="mt-3">Lihat produk</LinkButton>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8">
      <input type="hidden" name="items" value={serializedItems} />
      <CheckoutSteps current={2} />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="p-5">
          <h2 className="font-semibold text-zinc-950">Item pesanan</h2>
          <ul className="mt-4 divide-y divide-zinc-200">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex justify-between gap-4 py-3 text-sm text-zinc-700 first:pt-0 last:pb-0"
            >
              <span>
                {item.name} × {item.qty}
                {item.type === "rent" ? ` (${item.qty} jam)` : ""}
              </span>
              <span className="font-medium text-padel-navy">{formatRupiah(item.price * item.qty)}</span>
            </li>
          ))}
          </ul>
          <p className="mt-5 border-t border-zinc-200 pt-4 text-sm text-zinc-600">
          Stok produk akan dikurangi dan item sewa akan ditandai disewa setelah
          pesanan berhasil dibuat.
          </p>
        </Card>
        <Card className="h-fit p-5 lg:sticky lg:top-24">
          <h2 className="font-semibold text-padel-navy">Konfirmasi pesanan</h2>
          <p className="mt-3 text-sm text-zinc-600">Harga dan ketersediaan akan diperiksa kembali sebelum pesanan dibuat.</p>
          {error && <div className="mt-4"><Alert variant="error">Checkout gagal: {error}</Alert></div>}
          <Button type="submit" disabled={pending} className="mt-5 w-full">
            {pending ? "Memproses..." : "Buat pesanan"}
          </Button>
        </Card>
      </div>
    </form>
  );
}
