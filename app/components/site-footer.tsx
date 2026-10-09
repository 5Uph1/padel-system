import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-zinc-200 bg-zinc-50 px-6 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="font-semibold text-padel-navy">Padel Shop</Link>
        <p>Perlengkapan dan pengalaman bermain padel.</p>
      </div>
    </footer>
  );
}
