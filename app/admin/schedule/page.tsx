import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { formatTanggal } from "@/lib/format";
import { Alert, Badge, EmptyState, PageHeader } from "@/app/components/ui";
import { CancelBookingButton } from "./cancel-booking-button";

type Court = {
  id: string;
  name: string;
  is_active: boolean;
};

type Booking = {
  id: string;
  court_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  payment_status: "pending" | "paid";
  profiles:
    | { email: string | null }
    | { email: string | null }[]
    | null;
};

type Settings = {
  open_time: string;
  close_time: string;
};

function jakartaDateString(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDate(date: string) {
  return formatTanggal(`${date}T00:00:00Z`, "long");
}

export const instant = false;

export default async function AdminSchedulePage({
  searchParams,
}: PageProps<"/admin/schedule">) {
  await connection();
  const params = await searchParams;
  const supabase = await createClient();
  const today = jakartaDateString(new Date());
  const dates = Array.from({ length: 8 }, (_, index) => {
    const date = new Date(`${today}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + index);
    return date.toISOString().slice(0, 10);
  });
  const selectedDate =
    typeof params.date === "string" && dates.includes(params.date)
      ? params.date
      : dates[0];

  const [
    { data: courtData, error: courtError },
    { data: settingsData, error: settingsError },
    { data: bookingData, error: bookingError },
  ] = await Promise.all([
    supabase.from("courts").select("id, name, is_active").order("name"),
    supabase
      .from("court_settings")
      .select("open_time, close_time")
      .eq("id", true)
      .single(),
    supabase
      .from("court_bookings")
      .select("id, court_id, user_id, start_time, end_time, payment_status, profiles(email)")
      .eq("booking_date", selectedDate)
      .eq("status", "booked"),
  ]);

  const courts = (courtData ?? []) as Court[];
  const bookings = (bookingData ?? []) as Booking[];
  const settings = settingsData as Settings | null;
  const errors = [courtError, settingsError, bookingError].filter(
    (error) => error !== null,
  );
  const slots =
    settings &&
    settings.open_time.slice(3, 5) === "00" &&
    settings.close_time.slice(3, 5) === "00"
      ? Array.from(
          {
            length:
              Number(settings.close_time.slice(0, 2)) -
              Number(settings.open_time.slice(0, 2)),
          },
          (_, index) =>
            `${String(Number(settings.open_time.slice(0, 2)) + index).padStart(2, "0")}:00`,
        )
      : [];

  return (
    <main className="py-10">
      <PageHeader eyebrow="Jadwal lapangan" title="Jadwal booking" description="Lihat ketersediaan setiap lapangan berdasarkan tanggal." />
      {params.error === "cancel" && <div className="mb-5"><Alert variant="error">Booking lapangan tidak dapat dibatalkan. Muat ulang jadwal dan periksa statusnya.</Alert></div>}
      {params.saved === "cancelled" && <div className="mb-5"><Alert variant="success">Booking lapangan berhasil dibatalkan.</Alert></div>}
      <div className="mb-5 flex flex-wrap gap-2"><Badge variant="success">Kosong</Badge><Badge variant="info">Sudah dibooking</Badge></div>

      <div className="mt-6 flex flex-wrap gap-2">
        {dates.map((date) => (
          <Link
            key={date}
            href={`/admin/schedule?date=${date}`}
            aria-current={date === selectedDate ? "date" : undefined}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold ${
              date === selectedDate
                ? "bg-padel-navy text-padel-lime"
                : "border border-zinc-200 bg-white text-zinc-700"
            }`}
          >
            {date === dates[0] ? "Hari ini" : formatDate(date).split(",")[0] + " " + date.slice(8, 10)}
          </Link>
        ))}
      </div>

      <p className="mt-5 font-medium text-padel-navy">
        Jadwal {formatDate(selectedDate)}
      </p>

      {errors.length > 0 ? (
        <Alert variant="error">
          Jadwal gagal dimuat: {errors.map((error) => error.message).join(" ")}
        </Alert>
      ) : courts.length === 0 ? (
        <EmptyState title="Belum ada lapangan." description="Tambahkan lapangan melalui pengaturan lapangan."><Link href="/admin/courts" className="font-semibold text-padel-blue">Pengaturan lapangan</Link></EmptyState>
      ) : !settings || slots.length === 0 ? (
        <Alert variant="info">
          Atur jam operasional pada jam penuh di{" "}
          <Link href="/admin/courts" className="font-semibold underline">
            pengaturan lapangan
          </Link>
          .
        </Alert>
      ) : (
        <div className="mt-5 space-y-5">
          {courts.map((court) => {
            const courtBookings = bookings.filter(
              (booking) => booking.court_id === court.id,
            );
            const bookingByTime = new Map(
              courtBookings.map((booking) => [
                booking.start_time.slice(0, 5),
                booking,
              ]),
            );

            return (
              <section
                key={court.id}
                className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
              >
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4">
                  <h2 className="font-semibold text-padel-navy">{court.name}</h2>
                  <Badge variant={court.is_active ? "success" : "neutral"}>{court.is_active ? "Aktif" : "Nonaktif"}</Badge>
                </header>
                <ul className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                  {slots.map((slot) => {
                    const booking = bookingByTime.get(slot);
                    const profile = booking?.profiles;
                    const email = Array.isArray(profile)
                      ? profile[0]?.email
                      : profile?.email;
                    const hour = Number(slot.slice(0, 2));

                    return (
                      <li
                        key={slot}
                        className={`rounded-xl border p-4 ${
                          booking
                          ? "border-padel-blue bg-blue-50"
                            : "border-lime-200 bg-lime-50"
                        }`}
                      >
                        <p className="font-semibold text-padel-navy">
                          {slot}–{String(hour + 1).padStart(2, "0")}:00
                        </p>
                        <p
                          className={`mt-1 text-sm font-medium ${
                            booking ? "text-padel-blue" : "text-green-800"
                          }`}
                        >
                          {booking ? "Sudah dibooking" : "Kosong"}
                        </p>
                        {booking && (
                          <>
                            <p className="mt-2 break-all text-xs text-zinc-600">
                              {email ?? `User ${booking.user_id.slice(0, 8)}`}
                            </p>
                            <Badge variant={booking.payment_status === "paid" ? "success" : "warning"}>
                              {booking.payment_status === "paid" ? "Sudah dibayar" : "Menunggu pembayaran"}
                            </Badge>
                            <CancelBookingButton bookingId={booking.id} date={selectedDate} />
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
