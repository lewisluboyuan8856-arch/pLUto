"use client";

import { useEffect, useState } from "react";

import { updateBrowserSavedPaperNote } from "@/lib/browser-saved-papers";

export function NoteEditor({
  articleId,
  defaultValue
}: {
  articleId: string;
  defaultValue?: string;
}) {
  const [content, setContent] = useState(defaultValue || "");
  const [status, setStatus] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    setContent(defaultValue || "");
  }, [defaultValue]);

  function handleSave() {
    updateBrowserSavedPaperNote(articleId, content.trim());
    setStatus("saved");
    window.setTimeout(() => setStatus("idle"), 1800);
  }

  return (
    <div className="space-y-3">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={4}
        placeholder="Add your essay angle, method notes, or a quote to revisit later."
        className="w-full rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-sm text-ink outline-none placeholder:text-ink/35"
      />
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink/90"
        >
          {status === "saved" ? "Saved" : "Save note"}
        </button>
        <p className="text-xs text-ink/48">Stored locally for this Phase 1 prototype.</p>
      </div>
    </div>
  );
}
