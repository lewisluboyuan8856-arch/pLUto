"use client";

import { useEffect, useState } from "react";
import { BookmarkCheck, BookmarkPlus } from "lucide-react";

import {
  addBrowserSavedPaper,
  readBrowserSavedPapers,
  removeBrowserSavedPaper,
  SAVED_PAPERS_UPDATED_EVENT
} from "@/lib/browser-saved-papers";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ResearchArticle } from "@/lib/types";

export function SavePaperButton({ article }: { article: ResearchArticle }) {
  const [isSaved, setIsSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setIsAuthenticated(Boolean(data.session));
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsAuthenticated(Boolean(session));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function syncSaveToAccount() {
    const response = await fetch("/api/saved-papers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        papers: [
          {
            articleId: article.id,
            article,
            note: "",
            savedAt: new Date().toISOString()
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error("Unable to sync this paper to your account yet.");
    }
  }

  async function removeFromAccount() {
    const response = await fetch("/api/saved-papers", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        articleId: article.id
      })
    });

    if (!response.ok) {
      throw new Error("Unable to remove this paper from your account yet.");
    }
  }

  async function handleToggleSave() {
    setIsSyncing(true);

    if (isSaved) {
      removeBrowserSavedPaper(article.id);
      if (isAuthenticated) {
        try {
          await removeFromAccount();
          setMessage("Removed from your shortlist and account.");
        } catch {
          setMessage("Removed from this browser. Account sync will catch up later.");
        }
      } else {
        setMessage("Removed from your shortlist.");
      }
    } else {
      addBrowserSavedPaper(article);
      if (isAuthenticated) {
        try {
          await syncSaveToAccount();
          setMessage("Saved here and synced to your account.");
        } catch {
          setMessage("Saved locally. Account sync will retry from your shortlist.");
        }
      } else {
        setMessage("Saved in this browser.");
      }
    }

    setIsSyncing(false);
    window.setTimeout(() => setMessage(""), 2200);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleToggleSave}
        disabled={isSyncing}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
          isSaved
            ? "bg-ink text-white hover:bg-ink/90"
            : "border border-ink/10 text-ink/75 hover:border-ink/20 hover:bg-paper"
        }`}
      >
        {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
        {isSyncing ? "Saving..." : isSaved ? "Saved" : "Save paper"}
      </button>
      <p className="text-xs text-ink/48">
        {message ||
          (isAuthenticated
            ? "Stored locally and synced to your account when possible."
            : "Stored locally in this browser until you sign in.")}
      </p>
    </div>
  );
}
