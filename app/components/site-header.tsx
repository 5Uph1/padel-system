import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { CartLink } from "./cart-link";
import { logout } from "@/app/auth/actions";

export async function SiteHeader() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
      <Link href="/" className="text-lg font-bold tracking-tight text-padel-navy">
        Padel Shop
      </Link>
      <nav className="flex w-full flex-wrap items-center gap-2 text-sm sm:w-auto sm:gap-4">
        <Link href="/products" className="font-medium text-zinc-700 hover:text-padel-blue">
          Produk
        </Link>
        <Link href="/rentals" className="font-medium text-zinc-700 hover:text-padel-blue">
          Sewa
        </Link>
        <Link
          href="/rentals/courts"
          className="font-medium text-zinc-700 hover:text-padel-blue"
        >
          Lapangan
        </Link>
        {user ? (
          <>
            <Link
              href="/orders"
              className="font-medium text-zinc-700 hover:text-padel-blue"
            >
              Pesanan saya
            </Link>
            <CartLink />
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full bg-padel-blue px-4 py-2.5 font-semibold text-white hover:bg-blue-700"
              >
                Keluar
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-padel-blue px-4 py-2.5 font-semibold text-white hover:bg-blue-700"
          >
            Masuk
          </Link>
        )}
      </nav>
      </div>
    </header>
  );
}
