"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function register(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    redirect("/register?error=invalid");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect("/register?error=signup");
  }

  redirect("/login?registered=1");
}
