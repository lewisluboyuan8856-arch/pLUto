import type { ResearchArticle, SearchFilters } from "@/lib/types";

function normalizeText(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function keywordOverlap(article: ResearchArticle, keywords: string[]) {
  const haystack = normalizeText(`${article.title} ${article.abstract} ${article.concepts.join(" ")}`);
  const matched = keywords.filter((keyword) => haystack.includes(keyword)).length;
  return Math.min(100, matched * (100 / Math.max(keywords.length, 1)));
}

function recencyScore(year?: number) {
  if (!year) return 50;
  const age = new Date().getFullYear() - year;
  if (age <= 1) return 100;
  if (age <= 3) return 88;
  if (age <= 5) return 75;
  if (age <= 8) return 60;
  return 42;
}

function studentFitScore(article: ResearchArticle, level: SearchFilters["level"]) {
  const abstractLength = article.abstract.split(" ").length;
  const jargonPenalty =
    (article.abstract.match(/\b(multivariate|heterogeneity|endogeneity|neurophysiological)\b/gi) || [])
      .length * 6;
  const base = level === "Secondary" ? 82 : level === "JC-IB" ? 76 : 70;
  return Math.max(45, Math.min(100, base - jargonPenalty + (abstractLength < 180 ? 8 : 0)));
}

export function scoreArticles(
  articles: ResearchArticle[],
  query: string,
  relatedTerms: string[],
  filters: SearchFilters
) {
  const keywords = normalizeText(`${query} ${relatedTerms.join(" ")}`)
    .split(/\s+/)
    .filter((word) => word.length > 3);

  return articles
    .map((article) => {
      const overlap = keywordOverlap(article, keywords);
      const recent = recencyScore(article.year);
      const studentFit = studentFitScore(article, filters.level);
      const reviewBoost = article.isReviewArticle ? 10 : 0;
      const accessBoost = article.isOpenAccess ? 7 : 0;
      const total = overlap * 0.52 + recent * 0.14 + studentFit * 0.22 + reviewBoost + accessBoost;

      return {
        ...article,
        relevanceScore: Math.round(total),
        studentFitScore: Math.round(studentFit),
        recencyScore: Math.round(recent),
        tags: [
          ...new Set(
            [
              article.isReviewArticle ? "Review article" : null,
              article.isOpenAccess ? "Open access" : null,
              recent >= 85 ? "Recent" : null,
              ...article.tags
            ].filter(Boolean) as string[]
          )
        ]
      };
    })
    .filter((article) => !filters.openAccessOnly || article.isOpenAccess)
    .filter((article) => !filters.reviewOnly || article.isReviewArticle)
    .sort((left, right) => {
      if (filters.sort === "recent") {
        return (right.year || 0) - (left.year || 0);
      }
      return right.relevanceScore - left.relevanceScore;
    });
}
