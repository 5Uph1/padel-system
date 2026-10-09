import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/app/components/site-header";
import { createClient } from "@/utils/supabase/server";

type Booking = {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  price: number;
  courts: { name: string } | { name: string }[] | null;
};

export const instant = false;

export default async function CourtBookingConfirmationPage({
  searchParams,
}: PageProps<"/rentals/courts/confirmation">) {
  const params = await searchParams;
  if (typeof params.booking !== "string") notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=%2Frentals%2Fcourts");

  const { data, error } = await supabase
    .from("court_bookings")
    .select("id, booking_date, start_time, end_time, price, courts(name)")
    .eq("id", params.booking)
    .eq("user_id", user.id)
    .single();
  if (error || !data) notFound();

  const booking = data as Booking;
  const court = Array.isArray(booking.courts)
    ? booking.courts[0]
    : booking.courts;
  const date = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${booking.booking_date}T00:00:00Z`));

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8 sm:px-8">
      <SiteHeader />
      <section className="mx-auto max-w-xl py-12">
        <p className="text-sm font-semibold text-padel-blue">
          Pembayaran simulasi berhasil
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-padel-navy">
          Lapangan berhasil dibooking
        </h1>
        <div className="mt-7 rounded-2xl border border-zinc-200 bg-white p-6">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-zinc-500">Lapangan</dt>
              <dd className="mt-1 font-semibold text-padel-navy">
                {court?.name ?? "Lapangan"}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Tanggal</dt>
              <dd className="mt-1 font-semibold text-padel-navy">{date}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Waktu</dt>
              <dd className="mt-1 font-semibold text-padel-navy">
                {booking.start_time.slice(0, 5)}–{booking.end_time.slice(0, 5)}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Total</dt>
              <dd className="mt-1 font-semibold text-padel-navy">
                Rp{Number(booking.price).toLocaleString("id-ID")}
              </dd>
            </div>
          </dl>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/rentals/courts"
            className="rounded-full bg-padel-blue px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Lihat jadwal
          </Link>
          <Link
            href="/orders"
            className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold text-padel-navy"
          >
            Pesanan saya
          </Link>
        </div>
      </section>
    </main>
  );
}
