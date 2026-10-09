"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function cancelRental(formData: FormData) {
  const itemId = formData.get("itemId");
  if (typeof itemId !== "string") redirect("/admin/rentals?error=cancel");

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_rental", { p_item_id: itemId });

  if (error) redirect("/admin/rentals?error=cancel");

  revalidatePath("/admin/rentals");
  revalidatePath("/rentals");
  revalidatePath("/products");
  redirect("/admin/rentals?saved=cancelled");
}
