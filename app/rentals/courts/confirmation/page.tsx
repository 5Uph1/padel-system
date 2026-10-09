import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/app/components/site-header";
import { createClient } from "@/utils/supabase/server";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { Badge, Card, LinkButton, PageHeader } from "@/app/components/ui";

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
  const date = formatTanggal(`${booking.booking_date}T00:00:00Z`, "long");

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8 sm:px-8">
      <SiteHeader />
      <section className="mx-auto max-w-xl py-12">
        <PageHeader eyebrow="Pembayaran simulasi berhasil" title="Lapangan berhasil dibooking" />
        <Card className="p-6">
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
                {formatRupiah(booking.price)}
              </dd>
            </div>
          </dl>
          <div className="mt-4"><Badge variant="success">Dikonfirmasi</Badge></div>
        </Card>
        <div className="mt-6 flex flex-wrap gap-3">
          <LinkButton href="/rentals/courts">Lihat jadwal</LinkButton>
          <LinkButton href="/orders" variant="secondary">Pesanan saya</LinkButton>
        </div>
      </section>
    </main>
  );
}
