import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { logout } from "@/app/auth/actions";
import { createClient } from "@/utils/supabase/server";

export const instant = false;

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=%2Fadmin");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || profile?.role !== "admin") redirect("/products");

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <Link href="/admin" className="text-lg font-semibold text-emerald-900">
          Padel Shop Admin
        </Link>
        <nav className="flex flex-wrap gap-5 text-sm">
          <Link href="/admin/stock" className="text-zinc-700 hover:text-emerald-800">
            Stok
          </Link>
          <Link href="/admin/rentals" className="text-zinc-700 hover:text-emerald-800">
            Sewa
          </Link>
          <Link href="/admin/courts" className="text-zinc-700 hover:text-emerald-800">
            Lapangan
          </Link>
          <Link href="/admin/schedule" className="text-zinc-700 hover:text-emerald-800">
            Jadwal
          </Link>
          <Link href="/admin/orders" className="text-zinc-700 hover:text-emerald-800">
            Pesanan
          </Link>
          <Link href="/products" className="text-zinc-700 hover:text-emerald-800">
            Lihat toko
          </Link>
          <form action={logout}>
            <button type="submit" className="font-medium text-padel-blue">
              Keluar
            </button>
          </form>
        </nav>
      </header>
      {children}
    </div>
  );
}
