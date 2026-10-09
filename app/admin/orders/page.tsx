import { createClient } from "@/utils/supabase/server";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { Alert, Badge, Card, EmptyState, PageHeader } from "@/app/components/ui";

type Order = {
  id: string;
  user_id: string;
  total: number;
  status: "pending" | "paid";
  created_at: string;
};

type Profile = {
  id: string;
  email: string | null;
};

type OrderLine = {
  order_id: string;
  qty: number;
  price: number;
  items:
    | { name: string; type: "sale" | "rent" }
    | { name: string; type: "sale" | "rent" }[]
    | null;
};

export const instant = false;

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orderData, error } = await supabase
    .from("orders")
    .select("id, user_id, total, status, created_at")
    .order("created_at", { ascending: false });
  const orders = (orderData ?? []) as Order[];
  const pendingOrders = orders.filter((order) => order.status === "pending").length;
  const totalRevenue = orders
    .filter((order) => order.status === "paid")
    .reduce((total, order) => total + order.total, 0);
  const userIds = [...new Set(orders.map((order) => order.user_id))];
  const orderIds = orders.map((order) => order.id);

  const [{ data: profileData, error: profileError }, { data: lineData, error: lineError }] =
    await Promise.all([
      userIds.length
        ? supabase.from("profiles").select("id, email").in("id", userIds)
        : Promise.resolve({ data: [], error: null }),
      orderIds.length
        ? supabase
            .from("order_items")
            .select("order_id, qty, price, items(name, type)")
            .in("order_id", orderIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  const profiles = (profileData ?? []) as Profile[];
  const lines = (lineData ?? []) as OrderLine[];
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const linesByOrderId = new Map<string, OrderLine[]>();
  for (const line of lines) {
    const groupedLines = linesByOrderId.get(line.order_id) ?? [];
    groupedLines.push(line);
    linesByOrderId.set(line.order_id, groupedLines);
  }

  return (
    <main className="py-5">
      <PageHeader eyebrow="Transaksi" title="Pesanan" description="Ringkasan dan detail pesanan pelanggan." />
      <section aria-label="Ringkasan pesanan" className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><p className="text-sm text-zinc-600">Total pesanan</p><p className="mt-2 text-2xl font-semibold text-padel-navy">{orders.length}</p></Card>
        <Card className="p-5"><p className="text-sm text-zinc-600">Menunggu pembayaran</p><p className="mt-2 text-2xl font-semibold text-padel-navy">{pendingOrders}</p></Card>
        <Card className="p-5"><p className="text-sm text-zinc-600">Total pendapatan</p><p className="mt-2 text-2xl font-semibold text-padel-navy">{formatRupiah(totalRevenue)}</p></Card>
      </section>
      {error || profileError || lineError ? (
        <Alert variant="error">
          Pesanan gagal dimuat:{" "}
          {[error, profileError, lineError]
            .filter((entry) => entry !== null)
            .map((entry) => entry.message)
            .join(" ")}
        </Alert>
      ) : orders.length === 0 ? (
        <EmptyState title="Belum ada pesanan." />
      ) : (
        <ul className="mt-6 space-y-5">
          {orders.map((order) => (
            <li
              key={order.id}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <p className="font-semibold text-zinc-950">
                    {profileById.get(order.user_id)?.email ?? "Email tidak tersedia"}
                  </p>
                  <p className="mt-1 break-all text-xs text-zinc-500">
                    ID pesanan: {order.id}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {formatTanggal(order.created_at, "datetime")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-padel-navy">
                    {formatRupiah(order.total)}
                  </p>
                  <Badge variant={order.status === "paid" ? "success" : "warning"} className="mt-2">
                    {order.status === "paid" ? "Dibayar" : "Menunggu pembayaran"}
                  </Badge>
                </div>
              </div>
              <ul className="mt-4 space-y-2 border-t border-zinc-200 pt-4">
                {(linesByOrderId.get(order.id) ?? []).map((line, index) => (
                  <li
                    key={`${order.id}-${index}`}
                    className="flex flex-wrap justify-between gap-2 text-sm text-zinc-700"
                  >
                    <span>
                      {(Array.isArray(line.items)
                        ? line.items[0]?.name
                        : line.items?.name) ?? "Item tidak tersedia"}{" "}
                      × {line.qty}
                      {(Array.isArray(line.items)
                        ? line.items[0]?.type
                        : line.items?.type) === "rent"
                        ? " (sewa)"
                        : ""}
                    </span>
                    <span>{formatRupiah(line.price * line.qty)}</span>
                  </li>
                ))}
                {(linesByOrderId.get(order.id) ?? []).length === 0 && (
                  <li className="text-sm text-zinc-500">
                    Detail item tidak tersedia.
                  </li>
                )}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
