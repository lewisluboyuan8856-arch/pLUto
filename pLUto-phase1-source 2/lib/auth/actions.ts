"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getBaseUrl } from "@/lib/utils";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";

export async function signInWithGoogleAction() {
  if (!hasSupabaseEnv()) {
    redirect("/auth?message=Add%20Supabase%20keys%20to%20enable%20Google%20sign-in.");
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect("/auth?message=Supabase%20is%20not%20configured.");
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getBaseUrl()}/auth/callback`
    }
  });

  if (error || !data.url) {
    redirect(`/auth?message=${encodeURIComponent(error?.message || "Unable to sign in.")}`);
  }

  redirect(data.url);
}

export async function signInWithEmailAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();

  if (!hasSupabaseEnv()) {
    redirect("/auth?message=Add%20Supabase%20keys%20to%20enable%20email%20login.");
  }

  if (!email) {
    redirect("/auth?message=Please%20enter%20an%20email%20address.");
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect("/auth?message=Supabase%20is%20not%20configured.");
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${getBaseUrl()}/auth/callback`
    }
  });

  redirect(
    error
      ? `/auth?message=${encodeURIComponent(error.message)}`
      : `/auth?message=${encodeURIComponent("Check your email for a secure sign-in link.")}`
  );
}

export async function signOutAction() {
  const supabase = createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/");
}
