"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function checkout(_previous: string | null, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=%2Fcheckout");

  const cartJson = formData.get("items");
  if (typeof cartJson !== "string") {
    return "Keranjang tidak valid. Silakan muat ulang halaman.";
  }

  let items: unknown;
  try {
    items = JSON.parse(cartJson);
  } catch {
    return "Data keranjang tidak valid. Silakan muat ulang halaman.";
  }

  if (
    !Array.isArray(items) ||
    items.length === 0 ||
    items.some(
      (item) =>
        typeof item?.id !== "string" ||
        !Number.isInteger(item?.qty) ||
        item.qty < 1,
    )
  ) {
    return "Keranjang kosong atau tidak valid.";
  }

  const { data: orderId, error } = await supabase.rpc(
    "create_checkout_order",
    {
      p_items: items.map((item: { id: string; qty: number }) => ({
        id: item.id,
        qty: item.qty,
      })),
    },
  );

  if (error) return error.message;
  if (typeof orderId !== "string") {
    return "Checkout gagal membuat pesanan.";
  }

  redirect(`/checkout/success?order=${encodeURIComponent(orderId)}`);
}

export async function payOrder(formData: FormData) {
  const orderId = formData.get("orderId");
  if (typeof orderId !== "string") redirect("/checkout");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=%2Fcheckout");

  const { error } = await supabase.rpc("pay_order", {
    p_order_id: orderId,
  });

  if (error) {
    redirect(
      `/checkout/success?order=${encodeURIComponent(orderId)}&error=payment`,
    );
  }

  redirect(
    `/checkout/success?order=${encodeURIComponent(orderId)}&paid=1`,
  );
}
