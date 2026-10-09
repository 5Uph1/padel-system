import { createClient } from "@/utils/supabase/server";
import { formatRupiah } from "@/lib/format";

type StockItem = {
  id: string;
  name: string;
  price: number;
  stock: number;
};


export const instant = false;

export default async function AdminStockPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .select("id, name, price, stock")
    .eq("type", "sale")
    .order("name");
  const items = (data ?? []) as StockItem[];

  return (
    <main className="py-10">
      <p className="text-sm font-medium text-emerald-800">Inventaris</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
        Stok produk
      </h1>
      {error ? (
        <p role="alert" className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-800">
          Stok gagal dimuat: {error.message}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-4 py-3 font-medium">Produk</th>
                <th className="px-4 py-3 font-medium">Harga</th>
                <th className="px-4 py-3 font-medium">Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-zinc-950">{item.name}</td>
                  <td className="px-4 py-3 text-zinc-700">
                    {formatRupiah(item.price)}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{item.stock}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-zinc-600">
                    Belum ada produk jual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
