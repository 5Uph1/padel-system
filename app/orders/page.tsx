import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/app/components/site-header";
import { createClient } from "@/utils/supabase/server";

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

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

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
        <p
          role="alert"
          className="mt-8 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          Riwayat pesanan gagal dimuat: {orderError.message}
        </p>
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
      <section className="py-10">
        <p className="text-sm font-medium text-emerald-800">Akun</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
          Pesanan saya
        </h1>
        <p className="mt-3 text-zinc-600">
          Riwayat pembelian dan penyewaan perlengkapan padel.
        </p>
      </section>

      {bookingError && (
        <p
          role="alert"
          className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          Riwayat booking lapangan gagal dimuat: {bookingError.message}
        </p>
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
              const bookingDate = new Intl.DateTimeFormat("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              }).format(new Date(`${booking.booking_date}T00:00:00Z`));

              return (
                <li
                  key={booking.id}
                  className="rounded-lg border border-zinc-200 bg-white p-5 sm:p-6"
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
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        booking.status === "booked"
                          ? "bg-lime-100 text-padel-navy"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {booking.status === "booked" ? "Dibooking" : "Dibatalkan"}
                    </span>
                  </div>
                  <p className="mt-4 border-t border-zinc-200 pt-4 text-sm font-semibold text-padel-navy">
                    Total: {priceFormatter.format(booking.price)}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {lineError ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          Detail item pesanan gagal dimuat: {lineError.message}
        </p>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <p className="text-zinc-600">
            {bookings.length > 0
              ? "Belum ada pesanan produk atau sewa perlengkapan."
              : "Kamu belum memiliki pesanan."}
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block text-sm font-semibold text-emerald-800"
          >
            Jelajahi produk
          </Link>
        </div>
      ) : (
        <ul className="space-y-5">
          {orders.map((order) => {
            const orderLines = linesByOrderId.get(order.id) ?? [];

            return (
              <li
                key={order.id}
                className="rounded-lg border border-zinc-200 bg-white p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-zinc-950">
                      Pesanan {order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="mt-1 text-sm text-zinc-600">
                      {dateFormatter.format(new Date(order.created_at))}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      order.status === "paid"
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {order.status === "paid" ? "Dibayar" : "Menunggu pembayaran"}
                  </span>
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
                          {priceFormatter.format(line.price * line.qty)}
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
                  <span className="text-lg font-semibold text-emerald-900">
                    {priceFormatter.format(order.total)}
                  </span>
                </div>
                {order.status === "pending" && (
                  <Link
                    href={`/checkout/success?order=${encodeURIComponent(order.id)}`}
                    className="mt-4 inline-block rounded-full bg-padel-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Lanjutkan pembayaran
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
