import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Chrome } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signInWithGoogleAction, signInWithPasswordAction, signUpWithPasswordAction } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/saved-papers";
import { hasSupabaseEnv } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Auth",
  robots: {
    index: false,
    follow: false
  }
};

type AuthPageProps = {
  searchParams: {
    message?: string;
  };
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const authEnabled = hasSupabaseEnv();
  const user = authEnabled ? await getCurrentUser() : null;

  if (user) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr]">
        <div className="rounded-[2.25rem] bg-ink p-10 text-white shadow-glow">
          <Badge className="border-white/15 bg-white/10 text-white">
            {authEnabled ? "Supabase auth enabled" : "Auth disabled"}
          </Badge>
          <h1 className="mt-5 font-display text-5xl leading-tight">
            Hi, I am pLUto, your study companion.
          </h1>
          <p className="mt-4 font-display text-3xl leading-tight text-white/92">
            Sign in to start smarter research.
          </p>
          <p className="mt-5 text-lg leading-8 text-white/72">
            Use Google for the fastest start, or sign in with email if you prefer. Once you are in,
            pLUto keeps your search, compare, and shortlist workflow connected to your session.
          </p>
        </div>

        <div className="rounded-[2.25rem] border border-ink/10 bg-white p-8 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/40">
            Account access
          </p>

          {searchParams.message ? (
            <div className="mt-5 rounded-[1.5rem] border border-sage/20 bg-sage/10 p-5 text-sm leading-7 text-ink/75">
              {searchParams.message}
            </div>
          ) : null}

          {!authEnabled ? (
            <div className="mt-6 rounded-[1.5rem] border border-coral/20 bg-coral/10 p-5 text-sm leading-7 text-coral">
              Supabase environment variables are missing, so authentication is disabled in this
              local environment. Add the Supabase URL and anon key to enable sign in.
            </div>
          ) : null}

          <div className="mt-6 space-y-6">
            <div className="rounded-[1.75rem] border border-ink/10 bg-paper p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/40">
                Primary sign-in
              </p>
              <h2 className="mt-3 font-display text-3xl text-ink">Continue with Google</h2>
              <p className="mt-3 text-sm leading-7 text-ink/65">
                This is the quickest way to start researching with your synced pLUto workspace.
              </p>
              <form action={signInWithGoogleAction} className="mt-5">
                <Button
                  type="submit"
                  className="h-14 w-full gap-3 text-base"
                  disabled={!authEnabled}
                >
                  <Chrome className="h-5 w-5" />
                  Continue with Google
                </Button>
              </form>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4 rounded-[1.5rem] bg-paper p-5">
                <div>
                  <h2 className="font-display text-2xl text-ink">Sign in with email</h2>
                  <p className="mt-2 text-sm leading-7 text-ink/65">
                    Use your existing account to load your saved papers and notes.
                  </p>
                </div>
                <form action={signInWithPasswordAction} className="space-y-4">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-ink/70">Email address</span>
                    <input
                      type="email"
                      name="email"
                      required
                      disabled={!authEnabled}
                      placeholder="student@example.com"
                      className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none placeholder:text-ink/35 disabled:opacity-60"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-ink/70">Password</span>
                    <input
                      type="password"
                      name="password"
                      required
                      disabled={!authEnabled}
                      placeholder="At least 6 characters"
                      className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none placeholder:text-ink/35 disabled:opacity-60"
                    />
                  </label>
                  <Button type="submit" variant="ghost" className="w-full" disabled={!authEnabled}>
                    Sign in with email
                  </Button>
                </form>
              </div>

              <form action={signUpWithPasswordAction} className="space-y-4 rounded-[1.5rem] bg-paper p-5">
                <div>
                  <h2 className="font-display text-2xl text-ink">Create account</h2>
                  <p className="mt-2 text-sm leading-7 text-ink/65">
                    Create an account if you want a separate email login for pLUto.
                  </p>
                </div>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-ink/70">Full name</span>
                  <input
                    type="text"
                    name="fullName"
                    disabled={!authEnabled}
                    placeholder="Optional"
                    className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none placeholder:text-ink/35 disabled:opacity-60"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-ink/70">Email address</span>
                  <input
                    type="email"
                    name="email"
                    required
                    disabled={!authEnabled}
                    placeholder="student@example.com"
                    className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none placeholder:text-ink/35 disabled:opacity-60"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-ink/70">Password</span>
                  <input
                    type="password"
                    name="password"
                    required
                    disabled={!authEnabled}
                    placeholder="At least 6 characters"
                    className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none placeholder:text-ink/35 disabled:opacity-60"
                  />
                </label>
                <Button type="submit" variant="ghost" className="w-full" disabled={!authEnabled}>
                  Create account
                </Button>
              </form>
            </div>

            {authEnabled ? (
              <div className="rounded-[1.5rem] border border-ink/10 bg-white p-5 text-sm leading-7 text-ink/65">
                After you sign in, pLUto sends you straight to the main research workspace at{" "}
                <span className="font-medium text-ink">/</span>.
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-ink/10 bg-white p-5 text-sm leading-7 text-ink/65">
                You can still inspect the UI locally, but sign-in stays disabled until Supabase
                environment variables are added.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
