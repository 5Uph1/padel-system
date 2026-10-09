import Image from "next/image";
import { connection } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { AddToCartButton } from "./add-to-cart-button";
import { SiteHeader } from "./site-header";
import { formatRupiah } from "@/lib/format";
import { Alert, Badge, EmptyState, PageHeader } from "./ui";

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
        <PageHeader
          eyebrow={isRental ? "Sewa perlengkapan" : "Perlengkapan padel"}
          title={isRental ? "Sewa raket padel" : "Belanja produk"}
          description={isRental
            ? "Pilih raket untuk bermain. Ketersediaan diperbarui sesuai status barang."
            : "Temukan raket, bola, dan perlengkapan padel untuk permainan berikutnya."}
        />
      </section>

      {error ? (
        <Alert variant="error">Katalog gagal dimuat: {error.message}</Alert>
      ) : items.length === 0 ? (
        <EmptyState title="Belum ada item di katalog ini." />
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
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
                  {isRental && <Badge variant={item.status === "available" ? "success" : "neutral"} className="shrink-0">{item.status === "available" ? "Tersedia" : "Disewa"}</Badge>}
                </div>
                <p className="text-lg font-semibold text-padel-navy">
                  {formatRupiah(item.price)}
                  {isRental && (
                    <span className="ml-1 text-sm font-normal text-zinc-500">
                      / jam
                    </span>
                  )}
                </p>
                {!isRental && (
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <span>Stok: {item.stock ?? 0}</span>
                    {(item.stock ?? 0) <= 3 && <Badge variant="warning">Stok menipis</Badge>}
                  </div>
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
