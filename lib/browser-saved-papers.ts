import type { BrowserSavedPaper, ResearchArticle } from "@/lib/types";

export const SAVED_PAPERS_STORAGE_KEY = "pluto.saved-papers";
export const SAVED_PAPERS_UPDATED_EVENT = "pluto:saved-papers-updated";

function canUseStorage() {
  return typeof window !== "undefined";
}

function normalizeSavedPapers(value: unknown): BrowserSavedPaper[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((entry): entry is BrowserSavedPaper => {
      return Boolean(
        entry &&
          typeof entry === "object" &&
          "articleId" in entry &&
          "article" in entry &&
          "note" in entry &&
          "savedAt" in entry &&
          typeof (entry as BrowserSavedPaper).articleId === "string" &&
          typeof (entry as BrowserSavedPaper).article?.id === "string" &&
          typeof (entry as BrowserSavedPaper).note === "string" &&
          typeof (entry as BrowserSavedPaper).savedAt === "string"
      );
    })
    .sort((left, right) => right.savedAt.localeCompare(left.savedAt));
}

function writeSavedPapers(nextPapers: BrowserSavedPaper[]) {
  if (!canUseStorage()) return;

  window.localStorage.setItem(SAVED_PAPERS_STORAGE_KEY, JSON.stringify(nextPapers));
  window.dispatchEvent(new Event(SAVED_PAPERS_UPDATED_EVENT));
}

export function readBrowserSavedPapers() {
  if (!canUseStorage()) return [];

  try {
    const rawValue = window.localStorage.getItem(SAVED_PAPERS_STORAGE_KEY);
    if (!rawValue) return [];
    return normalizeSavedPapers(JSON.parse(rawValue));
  } catch {
    return [];
  }
}

export function addBrowserSavedPaper(article: ResearchArticle) {
  const existing = readBrowserSavedPapers();
  const alreadySaved = existing.some((entry) => entry.articleId === article.id);

  if (alreadySaved) {
    return existing;
  }

  const nextPapers = [
    {
      articleId: article.id,
      article,
      note: "",
      savedAt: new Date().toISOString()
    },
    ...existing
  ];

  writeSavedPapers(nextPapers);
  return nextPapers;
}

export function removeBrowserSavedPaper(articleId: string) {
  const nextPapers = readBrowserSavedPapers().filter((entry) => entry.articleId !== articleId);
  writeSavedPapers(nextPapers);
  return nextPapers;
}

export function updateBrowserSavedPaperNote(articleId: string, note: string) {
  const nextPapers = readBrowserSavedPapers().map((entry) =>
    entry.articleId === articleId
      ? {
          ...entry,
          note
        }
      : entry
  );

  writeSavedPapers(nextPapers);
  return nextPapers;
}
