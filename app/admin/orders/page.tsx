import { createClient } from "@/utils/supabase/server";
import { formatRupiah, formatTanggal } from "@/lib/format";

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
    <main className="py-10">
      <p className="text-sm font-medium text-emerald-800">Transaksi</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
        Pesanan
      </h1>
      {error || profileError || lineError ? (
        <p role="alert" className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-800">
          Pesanan gagal dimuat:{" "}
          {[error, profileError, lineError]
            .filter((entry) => entry !== null)
            .map((entry) => entry.message)
            .join(" ")}
        </p>
      ) : orders.length === 0 ? (
        <p className="mt-6 rounded-md border border-zinc-200 p-6 text-zinc-600">
          Belum ada pesanan.
        </p>
      ) : (
        <ul className="mt-6 space-y-5">
          {orders.map((order) => (
            <li
              key={order.id}
              className="rounded-lg border border-zinc-200 p-5"
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
                  <p className="font-semibold text-emerald-900">
                    {formatRupiah(order.total)}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                      order.status === "paid"
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {order.status === "paid" ? "Dibayar" : "Menunggu pembayaran"}
                  </span>
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
