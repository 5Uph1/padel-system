"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function bookCourt(formData: FormData) {
  const courtId = formData.get("courtId");
  const bookingDate = formData.get("bookingDate");
  const startTime = formData.get("startTime");

  if (
    typeof courtId !== "string" ||
    typeof bookingDate !== "string" ||
    typeof startTime !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(bookingDate) ||
    !/^\d{2}:\d{2}$/.test(startTime)
  ) {
    redirect("/rentals/courts?error=invalid");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/rentals/courts")}`);
  }

  const { data: bookingId, error } = await supabase.rpc("book_court", {
    p_court_id: courtId,
    p_booking_date: bookingDate,
    p_start_time: startTime,
  });

  if (error) {
    const reason = error.message.toLowerCase().includes("sudah dibooking")
      ? "taken"
      : "unavailable";
    redirect(
      `/rentals/courts?date=${encodeURIComponent(bookingDate)}&court=${encodeURIComponent(courtId)}&error=${reason}`,
    );
  }

  if (typeof bookingId !== "string") {
    redirect("/rentals/courts?error=failed");
  }

  revalidatePath("/rentals/courts");
  revalidatePath("/admin/schedule");
  revalidatePath("/orders");
  redirect(`/rentals/courts/confirmation?booking=${encodeURIComponent(bookingId)}`);
}
