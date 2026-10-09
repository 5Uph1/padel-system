import { createClient } from "@/utils/supabase/server";
import { formatRupiah } from "@/lib/format";
import { Alert, Badge, Card, EmptyState, PageHeader } from "@/app/components/ui";

type RentalItem = {
  id: string;
  name: string;
  price: number;
  status: "available" | "rented";
};


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
    <main className="py-5">
      <PageHeader eyebrow="Inventaris" title="Status perlengkapan sewa" description="Pantau status raket dan perlengkapan yang disewakan." />
      {error ? (
        <Alert variant="error">Status sewa gagal dimuat: {error.message}</Alert>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-zinc-50 text-zinc-600">
              <tr className="border-b border-zinc-200">
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Harga / jam</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {items.map((item) => (
                <tr key={item.id} className="odd:bg-white even:bg-zinc-50/70 hover:bg-blue-50/60">
                  <td className="px-4 py-3 font-medium text-zinc-950">{item.name}</td>
                  <td className="px-4 py-3 text-zinc-700">
                    {formatRupiah(item.price)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={item.status === "available" ? "success" : "neutral"}>{item.status === "available" ? "Tersedia" : "Disewa"}</Badge>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                    <td colSpan={3} className="px-4 py-6">
                    <EmptyState title="Belum ada item sewa." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}
    </main>
  );
}
