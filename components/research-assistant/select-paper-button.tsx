"use client";

import { useEffect, useState } from "react";
import { Bot, CheckCheck } from "lucide-react";

import {
  ASSISTANT_SELECTION_UPDATED_EVENT,
  isAssistantArticleSelected,
  readAssistantSelection,
  toggleAssistantArticle
} from "@/lib/research-assistant/client-storage";
import type { ResearchArticle } from "@/lib/types";

export function SelectPaperButton({ article }: { article: ResearchArticle }) {
  const [isSelected, setIsSelected] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    function syncSelection() {
      setIsSelected(isAssistantArticleSelected(article.id));
    }

    syncSelection();
    window.addEventListener(ASSISTANT_SELECTION_UPDATED_EVENT, syncSelection);
    window.addEventListener("storage", syncSelection);

    return () => {
      window.removeEventListener(ASSISTANT_SELECTION_UPDATED_EVENT, syncSelection);
      window.removeEventListener("storage", syncSelection);
    };
  }, [article.id]);

  function handleSelect() {
    const result = toggleAssistantArticle(article);

    if (result.maxReached) {
      setMessage("You can compare or chat with up to 5 papers at a time.");
      window.setTimeout(() => setMessage(""), 2200);
      return;
    }

    setMessage(
      result.selected
        ? `Added to Research Assistant (${readAssistantSelection().length}/5).`
        : "Removed from Research Assistant."
    );
    window.setTimeout(() => setMessage(""), 2200);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleSelect}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
          isSelected
            ? "bg-sage text-white hover:bg-sage/90"
            : "border border-ink/10 text-ink/75 hover:border-ink/20 hover:bg-paper"
        }`}
      >
        {isSelected ? <CheckCheck className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        {isSelected ? "Selected" : "Use in assistant"}
      </button>
      <p className="text-xs text-ink/48">
        {message || "Pick 2 to 5 papers to compare, question, or synthesize."}
      </p>
    </div>
  );
}
