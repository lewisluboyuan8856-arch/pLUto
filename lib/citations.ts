import { formatAuthors, formatYear } from "@/lib/utils";
import type { ResearchArticle } from "@/lib/types";

function formatAuthorListForCitation(authors: string[]) {
  return authors.length ? authors.join(", ") : "Unknown author";
}

export function buildApaCitation(article: ResearchArticle) {
  const authorText = formatAuthorListForCitation(article.authors);
  const yearText = formatYear(article.year);
  const journal = article.journal ? ` ${article.journal}.` : "";
  return `${authorText} (${yearText}). ${article.title}.${journal} ${article.url}`.trim();
}

export function buildMlaCitation(article: ResearchArticle) {
  const authorText = formatAuthors(article.authors);
  const yearText = article.year ? `, ${article.year}` : "";
  const journal = article.journal ? `, ${article.journal}` : "";
  return `${authorText}. "${article.title}."${journal}${yearText}, ${article.url}.`;
}
