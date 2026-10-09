import Link from "next/link";
import { connection } from "next/server";
import { SiteHeader } from "@/app/components/site-header";
import { createClient } from "@/utils/supabase/server";
import { bookCourt } from "./actions";

type Court = {
  id: string;
  name: string;
  price_per_hour: number;
};

type CourtSetting = {
  open_time: string;
  close_time: string;
};

type CourtBooking = {
  court_id: string;
  start_time: string;
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
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function formatTime(time: string) {
  return time.slice(0, 5);
}

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const bookingErrors: Record<string, string> = {
  invalid: "Pilihan jadwal tidak valid.",
  taken: "Slot baru saja dibooking pengguna lain. Silakan pilih jadwal lain.",
  unavailable: "Lapangan atau slot tidak tersedia. Perbarui jadwal dan coba lagi.",
  failed: "Booking gagal dibuat. Silakan coba lagi.",
};

export const instant = false;

export default async function CourtBookingPage({
  searchParams,
}: PageProps<"/rentals/courts">) {
  await connection();
  const params = await searchParams;
  const supabase = await createClient();
  const today = jakartaDateString(new Date());
  const availableDates = Array.from({ length: 8 }, (_, index) => {
    const date = new Date(`${today}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + index);
    return date.toISOString().slice(0, 10);
  });
  const selectedDate =
    typeof params.date === "string" && availableDates.includes(params.date)
      ? params.date
      : availableDates[0];

  const [{ data: courtData, error: courtError }, { data: settingsData, error: settingsError }, { data: userData }] =
    await Promise.all([
      supabase
        .from("courts")
        .select("id, name, price_per_hour")
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("court_settings")
        .select("open_time, close_time")
        .eq("id", true)
        .single(),
      supabase.auth.getUser(),
    ]);

  const courts = (courtData ?? []) as Court[];
  const settings = settingsData as CourtSetting | null;
  const selectedCourtId =
    typeof params.court === "string" &&
    courts.some((court) => court.id === params.court)
      ? params.court
      : courts[0]?.id;
  const selectedCourt = courts.find((court) => court.id === selectedCourtId);
  const { data: bookingData, error: bookingError } =
    selectedCourt && !settingsError
      ? await supabase
          .from("court_bookings")
          .select("court_id, start_time")
          .eq("booking_date", selectedDate)
          .eq("court_id", selectedCourt.id)
          .eq("status", "booked")
      : { data: [], error: null };
  const bookings = (bookingData ?? []) as CourtBooking[];
  const bookedSlots = new Set(
    bookings.map((booking) => booking.start_time.slice(0, 5)),
  );
  const openHour = settings ? Number(settings.open_time.slice(0, 2)) : 8;
  const closeHour = settings ? Number(settings.close_time.slice(0, 2)) : 22;
  const hasFullHourSchedule =
    settings &&
    settings.open_time.slice(3, 5) === "00" &&
    settings.close_time.slice(3, 5) === "00";
  const slots = hasFullHourSchedule
    ? Array.from({ length: closeHour - openHour }, (_, index) =>
        `${String(openHour + index).padStart(2, "0")}:00`,
      )
    : [];
  const errorMessage =
    typeof params.error === "string" ? bookingErrors[params.error] : undefined;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 sm:px-8">
      <SiteHeader />
      <section className="py-10">
        <p className="text-sm font-semibold text-padel-blue">
          Pesan lapangan
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-padel-navy sm:text-4xl">
          Pilih jadwal bermain
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-600">
          Pilih lapangan dan slot 1 jam. Booking dikonfirmasi melalui pembayaran
          simulasi dan jadwal yang sudah dibayar tidak dapat dipilih pengguna lain.
        </p>
      </section>

      {errorMessage && (
        <p
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {errorMessage}
        </p>
      )}

      {courtError || settingsError || bookingError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          Jadwal lapangan gagal dimuat:{" "}
          {[courtError, settingsError, bookingError]
            .filter((error) => error !== null)
            .map((error) => error.message)
            .join(" ")}
        </p>
      ) : courts.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <p className="font-medium text-padel-navy">
            Belum ada lapangan yang tersedia.
          </p>
          <p className="mt-2 text-sm text-zinc-600">
            Silakan kembali lagi nanti.
          </p>
        </div>
      ) : !settings ? (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
          Pengaturan jam operasional belum tersedia.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2" aria-label="Pilih tanggal">
            {availableDates.map((date) => (
              <Link
                key={date}
                href={`/rentals/courts?date=${date}${selectedCourtId ? `&court=${selectedCourtId}` : ""}`}
                aria-current={date === selectedDate ? "date" : undefined}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold ${
                  date === selectedDate
                    ? "bg-padel-navy text-padel-lime"
                    : "border border-zinc-200 bg-white text-zinc-700 hover:border-padel-blue"
                }`}
              >
                {date === availableDates[0] ? "Hari ini" : formatDate(date)}
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
            <aside>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Pilih lapangan
              </h2>
              <ul className="mt-3 space-y-2">
                {courts.map((court) => (
                  <li key={court.id}>
                    <Link
                      href={`/rentals/courts?date=${selectedDate}&court=${court.id}`}
                      aria-current={court.id === selectedCourtId ? "true" : undefined}
                      className={`block rounded-xl border p-4 ${
                        court.id === selectedCourtId
                          ? "border-padel-blue bg-blue-50"
                          : "border-zinc-200 bg-white hover:border-padel-blue"
                      }`}
                    >
                      <span className="block font-semibold text-padel-navy">
                        {court.name}
                      </span>
                      <span className="mt-1 block text-sm text-zinc-600">
                        {priceFormatter.format(court.price_per_hour)} / jam
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>

            {selectedCourt && (
              <section>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-padel-navy">
                      {selectedCourt.name}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-600">
                      {formatDate(selectedDate)} · Jam operasional{" "}
                      {formatTime(settings.open_time)}–{formatTime(settings.close_time)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-padel-blue">
                    {priceFormatter.format(selectedCourt.price_per_hour)} / jam
                  </p>
                </div>
                {slots.length === 0 ? (
                  <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
                    Jam operasional perlu diatur dengan waktu mulai dan selesai
                    pada jam penuh.
                  </p>
                ) : (
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {slots.map((slot) => {
                      const isBooked = bookedSlots.has(slot);

                      return (
                        <li
                          key={slot}
                          className={`rounded-xl border p-4 ${
                            isBooked
                              ? "border-zinc-200 bg-zinc-100"
                              : "border-zinc-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-semibold text-padel-navy">
                              {slot}–{String(Number(slot.slice(0, 2)) + 1).padStart(2, "0")}:00
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                isBooked
                                  ? "bg-zinc-200 text-zinc-600"
                                  : "bg-lime-100 text-padel-navy"
                              }`}
                            >
                              {isBooked ? "Sudah dibooking" : "Kosong"}
                            </span>
                          </div>
                          {!isBooked &&
                            (userData.user ? (
                              <form action={bookCourt} className="mt-4">
                                <input
                                  type="hidden"
                                  name="courtId"
                                  value={selectedCourt.id}
                                />
                                <input
                                  type="hidden"
                                  name="bookingDate"
                                  value={selectedDate}
                                />
                                <input
                                  type="hidden"
                                  name="startTime"
                                  value={slot}
                                />
                                <button
                                  type="submit"
                                  className="w-full rounded-full bg-padel-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                  Bayar &amp; booking
                                </button>
                              </form>
                            ) : (
                              <Link
                                href={`/login?next=${encodeURIComponent("/rentals/courts")}`}
                                className="mt-4 block rounded-full bg-padel-blue px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700"
                              >
                                Masuk untuk booking
                              </Link>
                            ))}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            )}
          </div>
        </>
      )}
    </main>
  );
}
