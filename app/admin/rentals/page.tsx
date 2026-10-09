import { createClient } from "@/utils/supabase/server";
import { formatRupiah } from "@/lib/format";
import { formatTanggal } from "@/lib/format";
import { Alert, Card, EmptyState, PageHeader } from "@/app/components/ui";
import { RentalStatusBadge } from "@/app/components/rental-status-badge";
import { CancelRentalButton } from "./cancel-rental-button";

type RentalItem = {
  id: string;
  name: string;
  price: number;
  status: "available" | "rented";
  rented_at: string | null;
  rented_until: string | null;
};


export const instant = false;

export default async function AdminRentalsPage({
  searchParams,
}: PageProps<"/admin/rentals">) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .select("id, name, price, status, rented_at, rented_until")
    .eq("type", "rent")
    .order("name");
  const items = (data ?? []) as RentalItem[];
  const activeItemIds = items.filter((item) => item.status === "rented").map((item) => item.id);
  const { data: orderLines } = activeItemIds.length
    ? await supabase
        .from("order_items")
        .select("item_id, orders(status, created_at)")
        .in("item_id", activeItemIds)
    : { data: [] };
  const paymentStatusByItem = new Map<string, { status: "pending" | "paid"; createdAt: string }>();

  for (const line of (orderLines ?? []) as unknown as Array<{
    item_id: string;
    orders: { status: "pending" | "paid"; created_at: string } | null;
  }>) {
    const currentOrder = paymentStatusByItem.get(line.item_id);
    if (line.orders && (!currentOrder || line.orders.created_at > currentOrder.createdAt)) {
      paymentStatusByItem.set(line.item_id, {
        status: line.orders.status,
        createdAt: line.orders.created_at,
      });
    }
  }

  function getRentalTimeLabel(item: RentalItem) {
    if (item.rented_until) return formatTanggal(item.rented_until, "datetime");
    if (item.status !== "rented") return "—";

    const paymentStatus = paymentStatusByItem.get(item.id)?.status;
    if (paymentStatus === "pending") return "Menunggu pembayaran";
    if (paymentStatus === "paid") return "Sudah dibayar · waktu berakhir belum tercatat";
    return "Status pembayaran tidak diketahui";
  }

  return (
    <main className="py-5">
      <PageHeader eyebrow="Inventaris" title="Status perlengkapan sewa" description="Pantau status raket dan perlengkapan yang disewakan." />
      {params.error === "cancel" && <div className="mb-5"><Alert variant="error">Sewa tidak dapat dibatalkan. Muat ulang halaman dan periksa status raket.</Alert></div>}
      {params.saved === "cancelled" && <div className="mb-5"><Alert variant="success">Sewa berhasil dibatalkan dan raket tersedia kembali.</Alert></div>}
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
                <th className="px-4 py-3 font-medium">Waktu berakhir</th>
                <th className="px-4 py-3 font-medium">Tindakan</th>
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
                    <RentalStatusBadge status={item.status} rentedUntil={item.rented_until} />
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{getRentalTimeLabel(item)}</td>
                  <td className="px-4 py-3">{item.status === "rented" ? <CancelRentalButton itemId={item.id} rentedUntil={item.rented_until} /> : "—"}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-4 py-6">
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
