"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=%2Fadmin%2Fcourts");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || profile?.role !== "admin") redirect("/products");
  return supabase;
}

function validPrice(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const price = Number(raw);
  return Number.isFinite(price) && price >= 0 && price <= 100_000_000
    ? price
    : null;
}

export async function addCourt(formData: FormData) {
  const name = formData.get("name");
  const price = validPrice(formData.get("price"));
  if (typeof name !== "string" || !name.trim() || name.trim().length > 80 || price === null) {
    redirect("/admin/courts?error=invalid");
  }

  const supabase = await requireAdmin();
  const { error } = await supabase.from("courts").insert({
    name: name.trim(),
    price_per_hour: price,
    is_active: true,
  });
  if (error) redirect("/admin/courts?error=save");

  revalidatePath("/admin/courts");
  revalidatePath("/rentals/courts");
  redirect("/admin/courts?saved=1");
}

export async function updateCourt(formData: FormData) {
  const id = formData.get("id");
  const name = formData.get("name");
  const price = validPrice(formData.get("price"));
  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    !name.trim() ||
    name.trim().length > 80 ||
    price === null
  ) {
    redirect("/admin/courts?error=invalid");
  }

  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("courts")
    .update({ name: name.trim(), price_per_hour: price })
    .eq("id", id);
  if (error) redirect("/admin/courts?error=save");

  revalidatePath("/admin/courts");
  revalidatePath("/rentals/courts");
  redirect("/admin/courts?saved=1");
}

export async function toggleCourt(formData: FormData) {
  const id = formData.get("id");
  const active = formData.get("active");
  if (typeof id !== "string" || (active !== "true" && active !== "false")) {
    redirect("/admin/courts?error=invalid");
  }

  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("courts")
    .update({ is_active: active === "true" })
    .eq("id", id);
  if (error) redirect("/admin/courts?error=save");

  revalidatePath("/admin/courts");
  revalidatePath("/admin/schedule");
  revalidatePath("/rentals/courts");
  redirect("/admin/courts?saved=1");
}

export async function updateCourtSettings(formData: FormData) {
  const openTime = formData.get("openTime");
  const closeTime = formData.get("closeTime");
  const timePattern = /^(?:[01]\d|2[0-3]):00$/;
  if (
    typeof openTime !== "string" ||
    typeof closeTime !== "string" ||
    !timePattern.test(openTime) ||
    !timePattern.test(closeTime) ||
    openTime >= closeTime
  ) {
    redirect("/admin/courts?error=hours");
  }

  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("court_settings")
    .update({ open_time: openTime, close_time: closeTime })
    .eq("id", true);
  if (error) redirect("/admin/courts?error=save");

  revalidatePath("/admin/courts");
  revalidatePath("/admin/schedule");
  revalidatePath("/rentals/courts");
  redirect("/admin/courts?saved=1");
}
