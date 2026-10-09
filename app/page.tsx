import Link from "next/link";
import { SiteHeader } from "@/app/components/site-header";

export const instant = false;

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 py-5 sm:px-8">
      <SiteHeader />
      <section className="relative flex flex-1 flex-col justify-center overflow-hidden bg-padel-navy px-7 py-16 text-white sm:px-14 sm:py-24">
        <div className="relative z-10 max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-padel-lime">
            <span className="h-2 w-2 rounded-full bg-padel-lime" />
            Perlengkapan padel, siap untuk pertandinganmu
          </p>
          <h1 className="mt-7 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
            Main lebih baik. Pilih perlengkapan yang tepat.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-blue-100 sm:text-lg">
            Belanja perlengkapan pilihan atau sewa raket untuk sesi padel
            berikutnya.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/products"
              className="rounded-full bg-padel-lime px-6 py-3 text-sm font-bold text-padel-navy hover:bg-lime-300"
          >
            Lihat produk
          </Link>
          <Link
            href="/rentals"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Sewa raket
          </Link>
          <Link
            href="/rentals/courts"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Sewa lapangan
          </Link>
        </div>
        </div>
        <div className="mt-14 grid max-w-2xl grid-cols-2 gap-3 sm:mt-20">
          <div className="rounded-xl border border-white/15 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">Beli perlengkapan</p>
            <p className="mt-1 text-xs text-blue-100">Pilihan gear untuk permainanmu</p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">Sewa dengan mudah</p>
            <p className="mt-1 text-xs text-blue-100">Cek ketersediaan raket</p>
          </div>
        </div>
      </section>
      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border border-t-0 border-zinc-200 bg-white px-6 py-5 text-sm text-zinc-500 sm:px-8">
        <span>Padel Shop</span>
        <span>Perlengkapan tepat. Permainan hebat.</span>
      </footer>
    </main>
  );
}
