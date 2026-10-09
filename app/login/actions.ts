"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    redirect("/login?error=invalid");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=credentials");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profileError) {
    await supabase.auth.signOut();
    redirect("/login?error=profile");
  }

  const next = formData.get("next");
  const adminDestination =
    typeof next === "string" &&
    (next === "/admin" || next.startsWith("/admin/"))
      ? next
      : "/admin";

  if (profile.role === "admin") redirect(adminDestination);
  if (next === "/checkout" || next === "/rentals/courts" || next === "/orders") {
    redirect(next);
  }
  redirect("/products");
}
