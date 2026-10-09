import { createClient } from "@/utils/supabase/server";

type RentalItem = {
  id: string;
  name: string;
  price: number;
  status: "available" | "rented";
};

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export const instant = false;

export default async function AdminRentalsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .select("id, name, price, status")
    .eq("type", "rent")
    .order("name");
  const items = (data ?? []) as RentalItem[];

  return (
    <main className="py-10">
      <p className="text-sm font-medium text-emerald-800">Inventaris</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
        Status perlengkapan sewa
      </h1>
      {error ? (
        <p role="alert" className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-800">
          Status sewa gagal dimuat: {error.message}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Harga / hari</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-zinc-950">{item.name}</td>
                  <td className="px-4 py-3 text-zinc-700">
                    {priceFormatter.format(item.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        item.status === "available"
                          ? "bg-emerald-50 text-emerald-800"
                          : "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {item.status === "available" ? "Tersedia" : "Disewa"}
                    </span>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-zinc-600">
                    Belum ada item sewa.
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
