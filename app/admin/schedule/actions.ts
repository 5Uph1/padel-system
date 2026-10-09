"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function cancelCourtBooking(formData: FormData) {
  const bookingId = formData.get("bookingId");
  const date = formData.get("date");
  const safeDate = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";

  if (typeof bookingId !== "string") {
    redirect(`/admin/schedule?date=${safeDate}&error=cancel`);
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_court_booking", {
    p_booking_id: bookingId,
  });

  if (error) redirect(`/admin/schedule?date=${safeDate}&error=cancel`);

  revalidatePath("/admin/schedule");
  revalidatePath("/rentals/courts");
  revalidatePath("/orders");
  redirect(`/admin/schedule?date=${safeDate}&saved=cancelled`);
}
