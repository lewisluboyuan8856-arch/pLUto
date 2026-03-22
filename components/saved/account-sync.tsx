"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { readBrowserSavedPapers } from "@/lib/browser-saved-papers";

function buildSyncFingerprint(userId: string) {
  const browserPapers = readBrowserSavedPapers();
  const signature = browserPapers
    .map((paper) => `${paper.articleId}:${paper.savedAt}:${paper.note.length}`)
    .join("|");

  return `pluto-account-sync:${userId}:${signature}`;
}

export function AccountSync({ userId }: { userId: string }) {
  const router = useRouter();

  useEffect(() => {
    const browserPapers = readBrowserSavedPapers();
    if (!browserPapers.length) return;

    const syncKey = buildSyncFingerprint(userId);
    if (window.sessionStorage.getItem(syncKey)) return;

    let cancelled = false;

    async function syncLocalPapers() {
      const response = await fetch("/api/saved-papers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          papers: browserPapers
        })
      });

      if (!response.ok || cancelled) {
        return;
      }

      window.sessionStorage.setItem(syncKey, "1");
      router.refresh();
    }

    void syncLocalPapers();

    return () => {
      cancelled = true;
    };
  }, [router, userId]);

  return null;
}
