import { notFound, redirect } from "next/navigation";
import { CartClearOnMount } from "@/app/components/cart-clear-on-mount";
import { PayOrderForm } from "@/app/components/pay-order-form";
import { SiteHeader } from "@/app/components/site-header";
import { createClient } from "@/utils/supabase/server";
import { formatRupiah } from "@/lib/format";
import { Alert, Badge, Card, CheckoutSteps, LinkButton, PageHeader } from "@/app/components/ui";

export const instant = false;

export default async function CheckoutSuccessPage({
  searchParams,
}: PageProps<"/checkout/success">) {
  const params = await searchParams;
  const orderId = params.order;

  if (!orderId) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=%2Fcheckout");

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, total, status")
    .eq("id", orderId)
    .single();

  if (error || !order) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-8">
      <CartClearOnMount />
      <SiteHeader />
      <section className="py-8">
      <CheckoutSteps current={3} />
      <PageHeader title={order.status === "paid" ? "Pembayaran berhasil" : "Pesanan dibuat"} description="Ringkasan pesanan dan status pembayaran." />
      <Card className="p-6">
        <p className="text-sm text-zinc-600">Nomor pesanan</p>
        <p className="mt-1 break-all font-medium text-padel-navy">{order.id}</p>
        <p className="mt-5 text-sm text-zinc-600">Total</p>
        <p className="mt-1 text-xl font-semibold text-padel-navy">{formatRupiah(Number(order.total))}</p>
        <div className="mt-4"><Badge variant={order.status === "paid" ? "success" : "warning"}>{order.status === "paid" ? "Dibayar" : "Menunggu pembayaran"}</Badge></div>
      </Card>
      {params.error && order.status === "pending" && (
        <div className="mt-5"><Alert variant="error">Pembayaran simulasi gagal. Silakan coba lagi.</Alert></div>
      )}
      {order.status === "pending" && (
        <PayOrderForm orderId={order.id} />
      )}
      <LinkButton href="/products" variant="secondary" className="mt-6">Kembali belanja</LinkButton>
      </section>
    </main>
  );
}
