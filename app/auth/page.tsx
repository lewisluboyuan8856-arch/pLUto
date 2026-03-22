import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  signInWithGoogleAction,
  signInWithPasswordAction,
  signOutAction,
  signUpWithPasswordAction
} from "@/lib/auth/actions";
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

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr]">
        <div className="rounded-[2.25rem] bg-ink p-10 text-white shadow-glow">
          <Badge className="border-white/15 bg-white/10 text-white">
            {authEnabled ? "Supabase auth enabled" : "Auth disabled"}
          </Badge>
          <h1 className="mt-5 font-display text-5xl leading-tight">
            Sign in to sync your research shortlist across sessions.
          </h1>
          <p className="mt-5 text-lg leading-8 text-white/72">
            Sign in to keep saved papers and notes attached to your account. If auth is
            unavailable, the local browser shortlist still keeps working.
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

          {user ? (
            <div className="mt-6 space-y-5">
              <h2 className="font-display text-3xl text-ink">You are signed in.</h2>
              <p className="text-sm leading-7 text-ink/65">
                Your current session is tied to <span className="font-medium text-ink">{user.email}</span>.
                Open your shortlist to manage synced saved papers and notes.
              </p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/saved">Open shortlist</ButtonLink>
                <form action={signOutAction}>
                  <Button type="submit" variant="ghost">
                    Sign out
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="space-y-4 rounded-[1.5rem] bg-paper p-5">
                <div>
                  <h2 className="font-display text-2xl text-ink">Sign in</h2>
                  <p className="mt-2 text-sm leading-7 text-ink/65">
                    Use your existing account to load synced saved papers.
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
                  <Button type="submit" className="w-full" disabled={!authEnabled}>
                    Sign in
                  </Button>
                </form>
                <form action={signInWithGoogleAction}>
                  <Button type="submit" variant="ghost" className="w-full" disabled={!authEnabled}>
                    Continue with Google
                  </Button>
                </form>
              </div>

              <form action={signUpWithPasswordAction} className="space-y-4 rounded-[1.5rem] bg-paper p-5">
                <div>
                  <h2 className="font-display text-2xl text-ink">Create account</h2>
                  <p className="mt-2 text-sm leading-7 text-ink/65">
                    Create a Supabase-backed account so your shortlist can persist.
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
                <Button type="submit" className="w-full" disabled={!authEnabled}>
                  Create account
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
