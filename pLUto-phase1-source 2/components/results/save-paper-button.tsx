"use client";

import { useEffect, useState } from "react";
import { BookmarkCheck, BookmarkPlus } from "lucide-react";

import {
  addBrowserSavedPaper,
  readBrowserSavedPapers,
  removeBrowserSavedPaper,
  SAVED_PAPERS_UPDATED_EVENT
} from "@/lib/browser-saved-papers";
import type { ResearchArticle } from "@/lib/types";

export function SavePaperButton({ article }: { article: ResearchArticle }) {
  const [isSaved, setIsSaved] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    function syncSavedState() {
      setIsSaved(readBrowserSavedPapers().some((entry) => entry.articleId === article.id));
    }

    syncSavedState();
    window.addEventListener(SAVED_PAPERS_UPDATED_EVENT, syncSavedState);
    window.addEventListener("storage", syncSavedState);

    return () => {
      window.removeEventListener(SAVED_PAPERS_UPDATED_EVENT, syncSavedState);
      window.removeEventListener("storage", syncSavedState);
    };
  }, [article.id]);

  function handleToggleSave() {
    if (isSaved) {
      removeBrowserSavedPaper(article.id);
      setMessage("Removed from your shortlist.");
    } else {
      addBrowserSavedPaper(article);
      setMessage("Saved in this browser for Phase 1.");
    }

    window.setTimeout(() => setMessage(""), 2200);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleToggleSave}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
          isSaved
            ? "bg-ink text-white hover:bg-ink/90"
            : "border border-ink/10 text-ink/75 hover:border-ink/20 hover:bg-paper"
        }`}
      >
        {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
        {isSaved ? "Saved" : "Save paper"}
      </button>
      <p className="text-xs text-ink/48">{message || "Stored locally in this browser during Phase 1."}</p>
    </div>
  );
}
