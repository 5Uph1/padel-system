import Image from "next/image";
import { connection } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { AddToCartButton } from "./add-to-cart-button";
import { SiteHeader } from "./site-header";

type CatalogItem = {
  id: string;
  name: string;
  type: "sale" | "rent";
  price: number;
  stock: number | null;
  status: "available" | "rented" | null;
  image_url: string | null;
};

type CatalogPageProps = {
  type: CatalogItem["type"];
};

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export async function CatalogPage({ type }: CatalogPageProps) {
  await connection();
  const isRental = type === "rent";
  const supabase = await createClient();
  const [{ data, error }, { data: authData }] = await Promise.all([
    supabase
      .from("items")
      .select("id, name, type, price, stock, status, image_url")
      .eq("type", type)
      .order("name"),
    supabase.auth.getUser(),
  ]);
  const items = (data ?? []) as CatalogItem[];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:px-8">
      <SiteHeader />

      <section className="py-10">
        <p className="text-sm font-medium text-emerald-800">
          {isRental ? "Sewa perlengkapan" : "Perlengkapan padel"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
          {isRental ? "Sewa raket padel" : "Belanja produk"}
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-600">
          {isRental
            ? "Pilih raket untuk bermain. Ketersediaan diperbarui sesuai status barang."
            : "Temukan raket, bola, dan perlengkapan padel untuk permainan berikutnya."}
        </p>
      </section>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          Katalog gagal dimuat: {error.message}
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-md border border-zinc-200 p-6 text-zinc-600">
          Belum ada item di katalog ini.
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-lg border border-zinc-200 bg-white"
            >
              <div className="relative aspect-[4/3] bg-zinc-100">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                    Gambar belum tersedia
                  </div>
                )}
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-zinc-950">{item.name}</h2>
                  {isRental && (
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        item.status === "available"
                          ? "bg-emerald-50 text-emerald-800"
                          : "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {item.status === "available" ? "Tersedia" : "Disewa"}
                    </span>
                  )}
                </div>
                <p className="text-lg font-semibold text-emerald-900">
                  {priceFormatter.format(item.price)}
                  {isRental && (
                    <span className="ml-1 text-sm font-normal text-zinc-500">
                      / hari
                    </span>
                  )}
                </p>
                {!isRental && (
                  <p className="text-sm text-zinc-600">
                    Stok: {item.stock ?? 0}
                  </p>
                )}
                <AddToCartButton
                  item={item}
                  authenticated={Boolean(authData.user)}
                  disabled={
                    isRental
                      ? item.status !== "available"
                      : (item.stock ?? 0) < 1
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
