import { createClient } from "@/utils/supabase/server";
import {
  addCourt,
  toggleCourt,
  updateCourt,
  updateCourtSettings,
} from "./actions";

type Court = {
  id: string;
  name: string;
  price_per_hour: number;
  is_active: boolean;
};

type Settings = {
  open_time: string;
  close_time: string;
};

const messages: Record<string, string> = {
  invalid: "Periksa nama lapangan dan harga.",
  hours: "Jam operasional harus pada jam penuh dan waktu tutup setelah waktu buka.",
  save: "Perubahan gagal disimpan. Periksa nama lapangan agar tidak duplikat.",
};

export const instant = false;

export default async function AdminCourtsPage({
  searchParams,
}: PageProps<"/admin/courts">) {
  const params = await searchParams;
  const supabase = await createClient();
  const [{ data: courtData, error: courtError }, { data: settings, error: settingsError }] =
    await Promise.all([
      supabase
        .from("courts")
        .select("id, name, price_per_hour, is_active")
        .order("name"),
      supabase
        .from("court_settings")
        .select("open_time, close_time")
        .eq("id", true)
        .single(),
    ]);
  const courts = (courtData ?? []) as Court[];
  const currentSettings = settings as Settings | null;
  const errorMessage =
    typeof params.error === "string" ? messages[params.error] : undefined;

  return (
    <main className="py-10">
      <p className="text-sm font-semibold text-padel-blue">Pengaturan lapangan</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-padel-navy">
        Kelola lapangan
      </h1>
      {errorMessage && (
        <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-800">
          {errorMessage}
        </p>
      )}
      {params.saved && (
        <p className="mt-5 rounded-lg bg-lime-100 p-4 text-sm text-padel-navy">
          Perubahan berhasil disimpan.
        </p>
      )}
      {courtError || settingsError ? (
        <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-800">
          Pengaturan gagal dimuat: {[courtError, settingsError]
            .filter((error) => error !== null)
            .map((error) => error.message)
            .join(" ")}
        </p>
      ) : (
        <>
          <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-padel-navy">
              Jam operasional
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Slot booking berdurasi satu jam dan dimulai pada jam penuh.
            </p>
            <form action={updateCourtSettings} className="mt-5 flex flex-wrap items-end gap-4">
              <label className="text-sm font-medium text-zinc-700">
                Buka
                <input
                  type="time"
                  name="openTime"
                  step={3600}
                  required
                  defaultValue={currentSettings?.open_time.slice(0, 5) ?? "08:00"}
                  className="mt-2 block rounded-lg border border-zinc-300 px-3 py-2.5"
                />
              </label>
              <label className="text-sm font-medium text-zinc-700">
                Tutup
                <input
                  type="time"
                  name="closeTime"
                  step={3600}
                  required
                  defaultValue={currentSettings?.close_time.slice(0, 5) ?? "22:00"}
                  className="mt-2 block rounded-lg border border-zinc-300 px-3 py-2.5"
                />
              </label>
              <button className="rounded-full bg-padel-blue px-5 py-2.5 text-sm font-semibold text-white">
                Simpan jam
              </button>
            </form>
          </section>

          <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-padel-navy">
              Tambah lapangan
            </h2>
            <form action={addCourt} className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <label className="text-sm font-medium text-zinc-700">
                Nama lapangan
                <input
                  name="name"
                  maxLength={80}
                  required
                  placeholder="Court 1"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3 py-2.5"
                />
              </label>
              <label className="text-sm font-medium text-zinc-700">
                Harga per jam (Rp)
                <input
                  type="number"
                  name="price"
                  min={0}
                  max={100000000}
                  step="1000"
                  required
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3 py-2.5"
                />
              </label>
              <button className="rounded-full bg-padel-lime px-5 py-2.5 text-sm font-bold text-padel-navy">
                Tambah lapangan
              </button>
            </form>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-padel-navy">
              Daftar lapangan
            </h2>
            {courts.length === 0 ? (
              <p className="mt-4 rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600">
                Belum ada lapangan.
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {courts.map((court) => (
                  <li
                    key={court.id}
                    className="rounded-2xl border border-zinc-200 bg-white p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-padel-navy">{court.name}</h3>
                        <p className="mt-1 text-sm text-zinc-600">
                          {court.is_active ? "Aktif dan tampil untuk booking" : "Nonaktif"}
                        </p>
                      </div>
                      <form action={toggleCourt}>
                        <input type="hidden" name="id" value={court.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={String(!court.is_active)}
                        />
                        <button className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-padel-blue">
                          {court.is_active ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </form>
                    </div>
                    <form
                      action={updateCourt}
                      className="mt-5 grid gap-4 border-t border-zinc-200 pt-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                    >
                      <input type="hidden" name="id" value={court.id} />
                      <label className="text-sm font-medium text-zinc-700">
                        Nama
                        <input
                          name="name"
                          maxLength={80}
                          required
                          defaultValue={court.name}
                          className="mt-2 block w-full rounded-lg border border-zinc-300 px-3 py-2.5"
                        />
                      </label>
                      <label className="text-sm font-medium text-zinc-700">
                        Harga per jam (Rp)
                        <input
                          type="number"
                          name="price"
                          min={0}
                          max={100000000}
                          step="1000"
                          required
                          defaultValue={court.price_per_hour}
                          className="mt-2 block w-full rounded-lg border border-zinc-300 px-3 py-2.5"
                        />
                      </label>
                      <button className="rounded-full bg-padel-blue px-5 py-2.5 text-sm font-semibold text-white">
                        Simpan
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
