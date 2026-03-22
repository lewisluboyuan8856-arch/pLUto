import type { ResearchArticle, SearchFilters } from "@/lib/types";

const JARGON_PATTERN =
  /\b(multivariate|heterogeneity|endogeneity|neurophysiological|epistemic|stochastic|longitudinal regression)\b/gi;

export function normalizeSearchText(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function extractKeywordTokens(query: string, relatedTerms: string[]) {
  return [...new Set(
    normalizeSearchText(`${query} ${relatedTerms.join(" ")}`)
      .split(/\s+/)
      .filter((word) => word.length > 2)
  )];
}

function scoreKeywordMatch(article: ResearchArticle, keywords: string[]) {
  const titleText = normalizeSearchText(article.title);
  const abstractText = normalizeSearchText(article.abstract);

  const titleMatches = keywords.filter((keyword) => titleText.includes(keyword)).length;
  const abstractMatches = keywords.filter((keyword) => abstractText.includes(keyword)).length;
  const titleScore = (titleMatches / Math.max(keywords.length, 1)) * 100;
  const abstractScore = (abstractMatches / Math.max(keywords.length, 1)) * 100;

  return Math.min(100, titleScore * 0.68 + abstractScore * 0.32);
}

function scoreRecency(year?: number) {
  if (!year) return 45;

  const age = new Date().getFullYear() - year;
  if (age <= 1) return 100;
  if (age <= 3) return 90;
  if (age <= 5) return 78;
  if (age <= 8) return 63;
  if (age <= 12) return 48;
  return 34;
}

function scoreCitationCount(citationCount?: number) {
  if (!citationCount) return 18;

  const normalized = Math.log10(citationCount + 1) / Math.log10(1001);
  return Math.min(100, Math.round(normalized * 100));
}

function scoreOpenAccess(isOpenAccess: boolean) {
  return isOpenAccess ? 100 : 35;
}

export function calculateStudentFitScore(
  article: ResearchArticle,
  level: SearchFilters["level"]
) {
  const abstractLength = article.abstract.split(/\s+/).length;
  const jargonPenalty = (article.abstract.match(JARGON_PATTERN) || []).length * 7;
  const lengthPenalty = abstractLength > 220 ? 10 : abstractLength > 160 ? 5 : 0;
  const base = level === "Secondary" ? 88 : level === "JC-IB" ? 80 : 72;

  return Math.max(45, Math.min(100, base - jargonPenalty - lengthPenalty));
}

export function difficultyFromStudentFit(score: number): ResearchArticle["difficulty"] {
  if (score >= 84) return "Accessible";
  if (score >= 68) return "Intermediate";
  return "Advanced";
}

export function scoreArticles(
  articles: ResearchArticle[],
  query: string,
  relatedTerms: string[],
  filters: SearchFilters
) {
  const keywords = extractKeywordTokens(query, relatedTerms);

  return articles
    .map((article) => {
      const keywordMatch = scoreKeywordMatch(article, keywords);
      const recencyScore = scoreRecency(article.year);
      const citationScore = scoreCitationCount(article.citationCount);
      const openAccessScore = scoreOpenAccess(article.isOpenAccess);
      const studentFitScore = calculateStudentFitScore(article, filters.level);
      const relevanceScore =
        keywordMatch * 0.48 +
        recencyScore * 0.2 +
        citationScore * 0.22 +
        openAccessScore * 0.1;

      return {
        ...article,
        relevanceScore: Math.round(relevanceScore),
        studentFitScore: Math.round(studentFitScore),
        recencyScore: Math.round(recencyScore),
        difficulty: difficultyFromStudentFit(studentFitScore),
        tags: [
          ...new Set(
            [
              article.isReviewArticle ? "Review article" : null,
              article.isOpenAccess ? "Open access" : null,
              article.citationCount && article.citationCount >= 100 ? "Highly cited" : null,
              recencyScore >= 85 ? "Recent" : null,
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
        return (right.year || 0) - (left.year || 0) || right.relevanceScore - left.relevanceScore;
      }

      return right.relevanceScore - left.relevanceScore || (right.year || 0) - (left.year || 0);
    });
}
