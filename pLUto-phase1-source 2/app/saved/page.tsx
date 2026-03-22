import { SavedPapersShell } from "@/components/saved/saved-papers-shell";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Saved papers"
};

export default function SavedPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge>Saved papers</Badge>
          <h1 className="mt-4 font-display text-5xl text-ink">Your research shortlist</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-ink/65">
            Save interesting papers from the results page, jot down notes, and test the shortlist
            flow. In Phase 1 everything is stored locally in this browser.
          </p>
        </div>
        <div className="rounded-full border border-ink/10 bg-white px-4 py-3 text-sm text-ink/60">
          Browser storage only for this phase
        </div>
      </div>
      <SavedPapersShell />
    </div>
  );
}
