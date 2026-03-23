"use client";

import type { ResearchArticle, ResearchAssistantSelection } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";

export const ASSISTANT_SELECTION_UPDATED_EVENT = "pluto:assistant-selection-updated";
const ASSISTANT_SELECTION_STORAGE_KEY = "pluto:assistant-selection";
const MAX_ASSISTANT_ARTICLES = 5;

function isBrowser() {
  return typeof window !== "undefined";
}

function persistSelection(selection: ResearchAssistantSelection[]) {
  if (!isBrowser()) return;

  window.localStorage.setItem(ASSISTANT_SELECTION_STORAGE_KEY, JSON.stringify(selection));
  window.dispatchEvent(new Event(ASSISTANT_SELECTION_UPDATED_EVENT));
}

export function readAssistantSelection() {
  if (!isBrowser()) return [] as ResearchAssistantSelection[];

  return safeJsonParse<ResearchAssistantSelection[]>(
    window.localStorage.getItem(ASSISTANT_SELECTION_STORAGE_KEY) || "[]",
    []
  );
}

export function readAssistantArticles() {
  return readAssistantSelection().map((entry) => entry.article);
}

export function isAssistantArticleSelected(articleId: string) {
  return readAssistantSelection().some((entry) => entry.article.id === articleId);
}

export function toggleAssistantArticle(article: ResearchArticle) {
  const currentSelection = readAssistantSelection();
  const isSelected = currentSelection.some((entry) => entry.article.id === article.id);

  if (isSelected) {
    const nextSelection = currentSelection.filter((entry) => entry.article.id !== article.id);
    persistSelection(nextSelection);
    return { selected: false, maxReached: false, count: nextSelection.length };
  }

  if (currentSelection.length >= MAX_ASSISTANT_ARTICLES) {
    return { selected: false, maxReached: true, count: currentSelection.length };
  }

  const nextSelection = [
    ...currentSelection,
    {
      article,
      selectedAt: new Date().toISOString()
    }
  ];

  persistSelection(nextSelection);
  return { selected: true, maxReached: false, count: nextSelection.length };
}

export function removeAssistantArticle(articleId: string) {
  const nextSelection = readAssistantSelection().filter((entry) => entry.article.id !== articleId);
  persistSelection(nextSelection);
}

export function clearAssistantSelection() {
  persistSelection([]);
}
