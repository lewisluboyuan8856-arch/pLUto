import type { Metadata } from "next";

import { AssistantLaunchBar } from "@/components/research-assistant/assistant-launch-bar";
import { AccountSavedPapersShell } from "@/components/saved/account-saved-papers-shell";
import { AccountSync } from "@/components/saved/account-sync";
import { SavedPapersShell } from "@/components/saved/saved-papers-shell";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth/actions";
import { getCurrentUser, getSavedPapers } from "@/lib/saved-papers";
import { hasSupabaseEnv } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Saved papers",
  robots: {
    index: false,
    follow: false
  }
};

export default async function SavedPage() {
  const authEnabled = hasSupabaseEnv();
  const user = authEnabled ? await getCurrentUser() : null;
  const syncedSavedPapers = authEnabled && user ? await getSavedPapers() : [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge>Saved papers</Badge>
          <h1 className="mt-4 font-display text-5xl text-ink">Your research shortlist</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-ink/65">
            Save interesting papers from the results page, jot down notes, and revisit sources
            later. Signed-in users get account sync, while local browser fallback still works when
            auth is unavailable.
          </p>
        </div>
        {user ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-ink/10 bg-white px-4 py-3 text-sm text-ink/60">
              Signed in as {user.email}
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-full border border-ink/10 bg-white px-4 py-3 text-sm font-medium text-ink/70 transition hover:border-ink/20 hover:bg-paper"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-full border border-ink/10 bg-white px-4 py-3 text-sm text-ink/60">
            {authEnabled ? "Browser storage fallback is active" : "Auth disabled, local storage only"}
          </div>
        )}
      </div>

      {!authEnabled ? (
        <div className="mt-8 rounded-[1.75rem] border border-coral/20 bg-coral/10 p-5 text-sm leading-7 text-coral">
          Supabase environment variables are missing, so account sync is disabled. Your shortlist
          still works locally in this browser.
        </div>
      ) : null}

      {authEnabled && !user ? (
        <div className="mt-8 rounded-[1.75rem] border border-ink/10 bg-white p-6 shadow-card">
          <h2 className="font-display text-3xl text-ink">Sign in to sync this shortlist.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/65">
            You can still save papers locally without an account, but signing in lets you persist
            them across sessions and devices.
          </p>
          <div className="mt-5">
            <ButtonLink href="/auth">Go to sign in</ButtonLink>
          </div>
        </div>
      ) : null}

      <AssistantLaunchBar />

      {authEnabled && user ? (
        <>
          <AccountSync userId={user.id} />
          <AccountSavedPapersShell savedPapers={syncedSavedPapers} />
        </>
      ) : (
        <SavedPapersShell />
      )}
    </div>
  );
}
