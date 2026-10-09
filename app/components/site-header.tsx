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
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 bg-white px-6 py-5">
      <Link href="/" className="text-lg font-bold tracking-tight text-padel-navy">
        Padel Shop
      </Link>
      <nav className="flex flex-wrap items-center gap-4 text-sm sm:gap-6">
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
    </header>
  );
}
