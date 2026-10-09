import { redirect } from "next/navigation";
import { connection } from "next/server";
import { logout } from "@/app/auth/actions";
import { createClient } from "@/utils/supabase/server";
import { AdminNav } from "./admin-nav";

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
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-8">
      <header className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-padel-blue">Padel Shop</p>
          <h1 className="mt-1 text-lg font-semibold text-padel-navy">Panel Admin</h1>
        </div>
        <form action={logout}>
          <button type="submit" className="min-h-10 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-padel-navy hover:bg-zinc-50">
            Keluar
          </button>
        </form>
      </header>
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="h-fit rounded-xl border border-zinc-200 bg-white p-3 shadow-sm lg:sticky lg:top-6">
          <AdminNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
