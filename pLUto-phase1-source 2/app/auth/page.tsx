import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Auth"
};

export default function AuthPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
      <div className="rounded-[2.25rem] border border-ink/10 bg-white p-10 shadow-card">
        <Badge>Planned for Phase 4</Badge>
        <h1 className="mt-5 font-display text-5xl text-ink">Authentication has not been turned on yet.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/65">
          Phase 1 focuses on the product flow only: landing, search, results, article detail, and
          a local shortlist. Email and Google sign-in will be wired up with Supabase in Phase 4.
        </p>
      </div>
    </div>
  );
}
