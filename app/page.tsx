import { SiteHeader } from "@/app/components/site-header";
import { LinkButton } from "@/app/components/ui";

export const instant = false;

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-5 sm:px-8">
      <SiteHeader />
      <section className="relative flex flex-col justify-center overflow-hidden rounded-2xl bg-padel-navy px-7 py-16 text-white shadow-sm sm:px-14 sm:py-24">
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
            <LinkButton href="/products" variant="secondary" className="!border-padel-lime !bg-padel-lime font-bold !text-padel-navy hover:!bg-lime-300">Lihat produk</LinkButton>
            <LinkButton href="/rentals" variant="secondary" className="!border-white/30 !bg-transparent !text-white hover:!bg-white/10">Sewa raket</LinkButton>
            <LinkButton href="/rentals/courts" variant="secondary" className="!border-white/30 !bg-transparent !text-white hover:!bg-white/10">Sewa lapangan</LinkButton>
          </div>
        </div>
      </section>
      <section className="grid gap-4 py-8 md:grid-cols-3">
        {[
          { title: "Produk", description: "Raket, bola, dan perlengkapan untuk permainanmu.", href: "/products", action: "Jelajahi produk" },
          { title: "Sewa Raket", description: "Coba raket pilihan untuk sesi berikutnya.", href: "/rentals", action: "Lihat raket sewaan" },
          { title: "Sewa Lapangan", description: "Pilih lapangan dan jadwal bermain yang tersedia.", href: "/rentals/courts", action: "Pilih jadwal" },
        ].map((feature) => (
          <article key={feature.title} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-padel-navy">{feature.title}</h2>
            <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-600">{feature.description}</p>
            <LinkButton href={feature.href} variant="secondary" className="mt-4">{feature.action}</LinkButton>
          </article>
        ))}
      </section>
    </main>
  );
}
