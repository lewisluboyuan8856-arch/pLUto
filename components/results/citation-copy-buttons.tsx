"use client";

import { useState } from "react";

import { buildApaCitation, buildMlaCitation } from "@/lib/citations";
import type { ResearchArticle } from "@/lib/types";

export function CitationCopyButtons({ article }: { article: ResearchArticle }) {
  const [copied, setCopied] = useState<"APA" | "MLA" | null>(null);

  async function copyCitation(style: "APA" | "MLA") {
    const citation = style === "APA" ? buildApaCitation(article) : buildMlaCitation(article);
    await navigator.clipboard.writeText(citation);
    setCopied(style);
    window.setTimeout(() => setCopied(null), 1800);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => copyCitation("APA")}
        className="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/75 transition hover:border-ink/20 hover:bg-paper"
      >
        {copied === "APA" ? "APA copied" : "Cite APA"}
      </button>
      <button
        type="button"
        onClick={() => copyCitation("MLA")}
        className="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/75 transition hover:border-ink/20 hover:bg-paper"
      >
        {copied === "MLA" ? "MLA copied" : "Cite MLA"}
      </button>
    </div>
  );
}
