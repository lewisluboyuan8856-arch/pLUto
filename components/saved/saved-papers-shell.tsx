"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, NotebookPen, Trash2 } from "lucide-react";

import { CitationCopyButtons } from "@/components/results/citation-copy-buttons";
import { NoteEditor } from "@/components/saved/note-editor";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import {
  readBrowserSavedPapers,
  removeBrowserSavedPaper,
  SAVED_PAPERS_UPDATED_EVENT
} from "@/lib/browser-saved-papers";
import type { BrowserSavedPaper } from "@/lib/types";
import { formatAuthors } from "@/lib/utils";

function formatSavedDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function SavedPapersShell() {
  const [savedPapers, setSavedPapers] = useState<BrowserSavedPaper[] | null>(null);

  useEffect(() => {
    function syncSavedPapers() {
      setSavedPapers(readBrowserSavedPapers());
    }

    syncSavedPapers();
    window.addEventListener(SAVED_PAPERS_UPDATED_EVENT, syncSavedPapers);
    window.addEventListener("storage", syncSavedPapers);

    return () => {
      window.removeEventListener(SAVED_PAPERS_UPDATED_EVENT, syncSavedPapers);
      window.removeEventListener("storage", syncSavedPapers);
    };
  }, []);

  if (savedPapers === null) {
    return (
      <div className="mt-10 grid gap-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="h-56 animate-pulse rounded-[2rem] border border-ink/10 bg-white/70"
          />
        ))}
      </div>
    );
  }

  if (!savedPapers.length) {
    return (
      <div className="mt-10 rounded-[2rem] border border-dashed border-ink/15 bg-white p-10 text-center">
        <h2 className="font-display text-3xl text-ink">Your shortlist is empty.</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-ink/60">
          Save papers from the results page and they will appear here with notes and citation tools.
          If you are not signed in, everything stays in this browser only.
        </p>
        <div className="mt-6 flex justify-center">
          <ButtonLink href="/search">Start a search</ButtonLink>
        </div>
      </div>
    );
  }

  const notedCount = savedPapers.filter((paper) => paper.note.trim()).length;

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
          <p className="mt-3 font-display text-2xl text-ink">This browser</p>
        </div>
      </div>

      {savedPapers.map((paper) => (
        <article key={paper.articleId} className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {paper.article.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
                <Badge className="bg-mist text-ink">Saved {formatSavedDate(paper.savedAt)}</Badge>
              </div>
              <div>
                <h2 className="font-display text-3xl text-ink">{paper.article.title}</h2>
                <p className="mt-2 text-sm text-ink/60">
                  {formatAuthors(paper.article.authors)} {paper.article.year ? `- ${paper.article.year}` : ""}{" "}
                  {paper.article.journal ? `- ${paper.article.journal}` : ""}
                </p>
              </div>
              <p className="max-w-3xl text-sm leading-7 text-ink/70">{paper.article.plainEnglishSummary}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => removeBrowserSavedPaper(paper.articleId)}
                className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/70 transition hover:border-coral/30 hover:bg-coral/5 hover:text-coral"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
              <Link
                href={{
                  pathname: `/articles/${paper.articleId}`,
                  query: { payload: JSON.stringify(paper.article) }
                }}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink/90"
              >
                <NotebookPen className="h-4 w-4" />
                Open breakdown
              </Link>
              <Link
                href={paper.article.url}
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
                Quick-copy buttons stay available here whether this shortlist is local or synced to
                your account.
              </p>
              <div className="mt-4">
                <CitationCopyButtons article={paper.article} />
              </div>
            </div>
            <div className="rounded-[1.5rem] bg-paper p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">Notes</p>
              <div className="mt-4">
                <NoteEditor articleId={paper.articleId} defaultValue={paper.note} />
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
