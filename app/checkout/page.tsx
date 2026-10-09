import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/app/components/checkout-form";
import { SiteHeader } from "@/app/components/site-header";
import { createClient } from "@/utils/supabase/server";

export const instant = false;

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=%2Fcheckout");

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 sm:px-8">
      <SiteHeader />
      <Link href="/cart" className="mt-5 inline-block text-sm text-emerald-800">
        Kembali ke keranjang
      </Link>
      <section className="py-10">
        <p className="text-sm font-medium text-emerald-800">Langkah terakhir</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
          Checkout
        </h1>
        <p className="mt-3 text-sm text-zinc-600">
          Pesanan akan dibuat dengan harga dan ketersediaan terbaru.
        </p>
        <CheckoutForm />
      </section>
    </main>
  );
}
