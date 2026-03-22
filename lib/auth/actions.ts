"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getRequestOrigin } from "@/lib/site";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";

function redirectWithMessage(message: string): never {
  redirect(`/auth?message=${encodeURIComponent(message)}`);
}

export async function signInWithGoogleAction() {
  if (!hasSupabaseEnv()) {
    redirectWithMessage("Add Supabase keys to enable Google sign-in.");
  }

  const supabaseClient = createSupabaseServerClient();
  if (!supabaseClient) {
    redirectWithMessage("Supabase is not configured.");
  }

  const requestOrigin = getRequestOrigin();
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${requestOrigin}/auth/callback`
    }
  });

  if (error || !data?.url) {
    redirectWithMessage(error?.message || "Unable to sign in.");
  }

  const oauthUrl = data.url;
  redirect(oauthUrl);
}

export async function signInWithPasswordAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!hasSupabaseEnv()) {
    redirectWithMessage("Add Supabase keys to enable email/password login.");
  }

  if (!email || !password) {
    redirectWithMessage("Enter both your email address and password.");
  }

  const supabaseClient = createSupabaseServerClient();
  if (!supabaseClient) {
    redirectWithMessage("Supabase is not configured.");
  }

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirectWithMessage(error.message);
  }

  revalidatePath("/", "layout");
  redirect("/saved");
}

export async function signUpWithPasswordAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("fullName") || "").trim();

  if (!hasSupabaseEnv()) {
    redirectWithMessage("Add Supabase keys to enable account creation.");
  }

  if (!email || !password) {
    redirectWithMessage("Enter both your email address and password.");
  }

  const supabaseClient = createSupabaseServerClient();
  if (!supabaseClient) {
    redirectWithMessage("Supabase is not configured.");
  }

  const requestOrigin = getRequestOrigin();
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${requestOrigin}/auth/callback`,
      data: {
        full_name: fullName || undefined
      }
    }
  });

  if (error) {
    redirectWithMessage(error.message);
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/saved");
  }

  redirectWithMessage("Account created. Check your email to confirm your address, then sign in.");
}

export async function signOutAction() {
  const supabaseClient = createSupabaseServerClient();
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/");
}
