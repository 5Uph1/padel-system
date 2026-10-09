import { redirect } from "next/navigation";
import { CheckoutForm } from "@/app/components/checkout-form";
import { SiteHeader } from "@/app/components/site-header";
import { createClient } from "@/utils/supabase/server";
import { PageHeader } from "@/app/components/ui";

export const instant = false;

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=%2Fcheckout");

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">
      <SiteHeader />
      <section className="py-10">
        <PageHeader eyebrow="Langkah terakhir" title="Checkout" description="Pesanan akan dibuat dengan harga dan ketersediaan terbaru." />
        <CheckoutForm />
      </section>
    </main>
  );
}
