import { redirect } from "next/navigation";
import { SiteHeader } from "@/app/components/site-header";
import { createClient } from "@/utils/supabase/server";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { Alert, Badge, Card, EmptyState, LinkButton, PageHeader } from "@/app/components/ui";

type Order = {
  id: string;
  total: number;
  status: "pending" | "paid";
  created_at: string;
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

type CourtBooking = {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  price: number;
  status: "booked" | "cancelled";
  courts: { name: string } | { name: string }[] | null;
};

export const instant = false;

export default async function OrderHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=%2Forders");

  const [
    { data: orderData, error: orderError },
    { data: bookingData, error: bookingError },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id, total, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("court_bookings")
      .select("id, booking_date, start_time, end_time, price, status, courts(name)")
      .eq("user_id", user.id)
      .order("booking_date", { ascending: false })
      .order("start_time", { ascending: false }),
  ]);

  if (orderError) {
    return (
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:px-8">
        <SiteHeader />
        <div className="mt-8"><Alert variant="error">Riwayat pesanan gagal dimuat: {orderError.message}</Alert></div>
      </main>
    );
  }

  const orders = (orderData ?? []) as Order[];
  const bookings = (bookingData ?? []) as CourtBooking[];
  const orderIds = orders.map((order) => order.id);
  const { data: lineData, error: lineError } = orderIds.length
    ? await supabase
        .from("order_items")
        .select("order_id, qty, price, items(name, type)")
        .in("order_id", orderIds)
    : { data: [], error: null };

  const lines = (lineData ?? []) as OrderLine[];
  const linesByOrderId = new Map<string, OrderLine[]>();
  for (const line of lines) {
    const groupedLines = linesByOrderId.get(line.order_id) ?? [];
    groupedLines.push(line);
    linesByOrderId.set(line.order_id, groupedLines);
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:px-8">
      <SiteHeader />
      <section className="py-10"><PageHeader eyebrow="Akun" title="Pesanan saya" description="Riwayat pembelian dan penyewaan perlengkapan padel." /></section>

      {bookingError && (
        <div className="mb-5"><Alert variant="error">Riwayat booking lapangan gagal dimuat: {bookingError.message}</Alert></div>
      )}

      {bookings.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-padel-navy">
            Booking lapangan
          </h2>
          <ul className="space-y-4">
            {bookings.map((booking) => {
              const court = Array.isArray(booking.courts)
                ? booking.courts[0]
                : booking.courts;
              const bookingDate = formatTanggal(`${booking.booking_date}T00:00:00Z`, "long");

              return (
                <li
                  key={booking.id}
                  className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-padel-navy">
                        {court?.name ?? "Lapangan"}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600">{bookingDate}</p>
                      <p className="mt-1 text-sm text-zinc-600">
                        {booking.start_time.slice(0, 5)}–
                        {booking.end_time.slice(0, 5)}
                      </p>
                    </div>
                    <Badge variant={booking.status === "booked" ? "success" : "neutral"}>{booking.status === "booked" ? "Dibooking" : "Dibatalkan"}</Badge>
                  </div>
                  <p className="mt-4 border-t border-zinc-200 pt-4 text-sm font-semibold text-padel-navy">
                    Total: {formatRupiah(booking.price)}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {lineError ? (
        <Alert variant="error">Detail item pesanan gagal dimuat: {lineError.message}</Alert>
      ) : orders.length === 0 ? (
        <EmptyState title={bookings.length > 0 ? "Belum ada pesanan produk atau sewa perlengkapan." : "Kamu belum memiliki pesanan."}><LinkButton href="/products" variant="secondary">Jelajahi produk</LinkButton></EmptyState>
      ) : (
        <ul className="space-y-5">
          {orders.map((order) => {
            const orderLines = linesByOrderId.get(order.id) ?? [];

            return (
              <li
                key={order.id}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-zinc-950">
                      Pesanan {order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="mt-1 text-sm text-zinc-600">
                      {formatTanggal(order.created_at, "datetime")}
                    </p>
                  </div>
                  <Badge variant={order.status === "paid" ? "success" : "warning"}>{order.status === "paid" ? "Dibayar" : "Menunggu pembayaran"}</Badge>
                </div>

                <ul className="mt-5 space-y-3 border-t border-zinc-200 pt-4">
                  {orderLines.map((line, index) => {
                    const item = Array.isArray(line.items)
                      ? line.items[0]
                      : line.items;

                    return (
                      <li
                        key={`${order.id}-${index}`}
                        className="flex flex-wrap justify-between gap-3 text-sm"
                      >
                        <span className="text-zinc-700">
                          {item?.name ?? "Item tidak tersedia"} × {line.qty}
                          {item?.type === "rent" ? " (sewa)" : ""}
                        </span>
                        <span className="font-medium text-zinc-900">
                          {formatRupiah(line.price * line.qty)}
                        </span>
                      </li>
                    );
                  })}
                  {orderLines.length === 0 && (
                    <li className="text-sm text-zinc-500">
                      Detail item tidak tersedia.
                    </li>
                  )}
                </ul>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-4">
                  <span className="text-sm font-medium text-zinc-700">
                    Total pesanan
                  </span>
                  <span className="text-lg font-semibold text-padel-navy">
                    {formatRupiah(order.total)}
                  </span>
                </div>
                {order.status === "pending" && (
                  <LinkButton href={`/checkout/success?order=${encodeURIComponent(order.id)}`} className="mt-4">
                    Lanjutkan pembayaran
                  </LinkButton>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
