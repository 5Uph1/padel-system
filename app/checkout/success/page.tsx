import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CartClearOnMount } from "@/app/components/cart-clear-on-mount";
import { PayOrderForm } from "@/app/components/pay-order-form";
import { SiteHeader } from "@/app/components/site-header";
import { createClient } from "@/utils/supabase/server";

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
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16 sm:px-8">
      <CartClearOnMount />
      <SiteHeader />
      <h1 className="mt-8 text-3xl font-semibold tracking-tight text-zinc-950">
        {order.status === "paid" ? "Pembayaran berhasil" : "Pesanan dibuat"}
      </h1>
      <p className="mt-3 text-zinc-600">
        Nomor pesanan: <span className="font-medium text-zinc-900">{order.id}</span>
      </p>
      <p className="mt-2 text-lg font-semibold text-emerald-900">
        Total: Rp{Number(order.total).toLocaleString("id-ID")}
      </p>
      <p className="mt-2 text-sm text-zinc-600">
        Status: {order.status === "paid" ? "Dibayar" : "Menunggu pembayaran"}
      </p>
      {params.error && order.status === "pending" && (
        <p
          role="alert"
          className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-800"
        >
          Pembayaran simulasi gagal. Silakan coba lagi.
        </p>
      )}
      {order.status === "pending" && (
        <PayOrderForm orderId={order.id} />
      )}
      <Link
        href="/products"
        className="mt-6 inline-block text-sm font-semibold text-emerald-800"
      >
        Kembali belanja
      </Link>
    </main>
  );
}
