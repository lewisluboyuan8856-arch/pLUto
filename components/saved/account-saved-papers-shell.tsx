import Link from "next/link";
import { ArrowUpRight, NotebookPen, Trash2 } from "lucide-react";

import { SelectPaperButton } from "@/components/research-assistant/select-paper-button";
import { CitationCopyButtons } from "@/components/results/citation-copy-buttons";
import { AccountNoteEditor } from "@/components/saved/account-note-editor";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { deleteSavedPaperAction } from "@/lib/actions/saved-papers";
import { buildArticleFromSavedPaperRecord } from "@/lib/saved-papers";
import type { SavedPaperRecord } from "@/lib/types";
import { formatAuthors } from "@/lib/utils";

function formatSavedDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function AccountSavedPapersShell({ savedPapers }: { savedPapers: SavedPaperRecord[] }) {
  if (!savedPapers.length) {
    return (
      <div className="mt-10 rounded-[2rem] border border-dashed border-ink/15 bg-white p-10 text-center">
        <h2 className="font-display text-3xl text-ink">Your synced shortlist is empty.</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-ink/60">
          Any papers you save while signed in will appear here. Browser-local papers from this
          device will also sync into your account when this page loads.
        </p>
        <div className="mt-6 flex justify-center">
          <ButtonLink href="/search">Start a search</ButtonLink>
        </div>
      </div>
    );
  }

  const notedCount = savedPapers.filter((paper) => paper.note?.content?.trim()).length;

  return (
    <div className="mt-10 space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-ink/10 bg-white p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">Saved papers</p>
          <p className="mt-3 font-display text-4xl text-ink">{savedPapers.length}</p>
        </div>
        <div className="rounded-[1.5rem] border border-ink/10 bg-white p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">Notes started</p>
          <p className="mt-3 font-display text-4xl text-ink">{notedCount}</p>
        </div>
        <div className="rounded-[1.5rem] border border-ink/10 bg-white p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">Storage mode</p>
          <p className="mt-3 font-display text-2xl text-ink">Supabase account</p>
        </div>
      </div>

      {savedPapers.map((paper) => {
        const article = buildArticleFromSavedPaperRecord(paper);

        return (
          <article key={paper.id} className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {paper.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                  <Badge className="bg-mist text-ink">Saved {formatSavedDate(paper.created_at)}</Badge>
                </div>
                <div>
                  <h2 className="font-display text-3xl text-ink">{paper.title}</h2>
                  <p className="mt-2 text-sm text-ink/60">
                    {formatAuthors(paper.authors)} {paper.year ? `- ${paper.year}` : ""}{" "}
                    {paper.journal ? `- ${paper.journal}` : ""}
                  </p>
                </div>
                <p className="max-w-3xl text-sm leading-7 text-ink/70">{paper.summary}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <SelectPaperButton article={article} />
                <form action={deleteSavedPaperAction}>
                  <input type="hidden" name="savedPaperId" value={paper.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/70 transition hover:border-coral/30 hover:bg-coral/5 hover:text-coral"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </form>
                <Link
                  href={{
                    pathname: `/articles/${paper.article_id}`,
                    query: { payload: JSON.stringify(article) }
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink/90"
                >
                  <NotebookPen className="h-4 w-4" />
                  Open breakdown
                </Link>
                <Link
                  href={paper.article_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/75 transition hover:border-ink/20 hover:bg-paper"
                >
                  Read source
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[1.5rem] bg-paper p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">Citations</p>
                <p className="mt-4 text-sm leading-7 text-ink/75">
                  Citation copy stays available here while saved papers are synced to your account.
                </p>
                <div className="mt-4">
                  <CitationCopyButtons article={article} />
                </div>
              </div>
              <div className="rounded-[1.5rem] bg-paper p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">Notes</p>
                <div className="mt-4">
                  <AccountNoteEditor savedPaperId={paper.id} defaultValue={paper.note?.content} />
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
