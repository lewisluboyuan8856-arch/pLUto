import { DEFAULT_FILTERS } from "@/lib/constants";
import {
  enrichArticlesWithAi,
  rewriteAcademicQuery
} from "@/lib/search/ai";
import { fetchOpenAlex, fetchSemanticScholar } from "@/lib/search/academic-sources";
import { buildMockSearchResponse } from "@/lib/search/mock-data";
import { normalizeSearchText, scoreArticles } from "@/lib/search/ranker";
import type {
  QueryRewrite,
  ResearchArticle,
  SearchFilters,
  SearchResponse
} from "@/lib/types";

function normalizeTitle(title: string) {
  return normalizeSearchText(title)
    .split(/\s+/)
    .filter((token) => token.length > 2)
    .join(" ");
}

function titleSimilarity(left: string, right: string) {
  const leftTokens = new Set(normalizeTitle(left).split(" ").filter(Boolean));
  const rightTokens = new Set(normalizeTitle(right).split(" ").filter(Boolean));

  if (!leftTokens.size || !rightTokens.size) return 0;

  let intersection = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersection += 1;
    }
  }

  const union = new Set([...leftTokens, ...rightTokens]).size;
  return intersection / Math.max(union, 1);
}

function hasUsableAbstract(article: ResearchArticle) {
  return Boolean(article.abstract && article.abstract !== "Abstract unavailable.");
}

function choosePreferredArticle(left: ResearchArticle, right: ResearchArticle) {
  function score(article: ResearchArticle) {
    return (
      (article.source === "OpenAlex" ? 40 : article.source === "Semantic Scholar" ? 28 : 10) +
      (hasUsableAbstract(article) ? 12 : 0) +
      (article.authors.length ? 6 : 0) +
      (article.url !== "#" ? 4 : 0) +
      (article.isOpenAccess ? 3 : 0) +
      (article.citationCount ? 2 : 0)
    );
  }

  return score(left) >= score(right) ? left : right;
}

function mergeDuplicateArticles(left: ResearchArticle, right: ResearchArticle): ResearchArticle {
  const preferred = choosePreferredArticle(left, right);
  const secondary = preferred === left ? right : left;

  return {
    ...preferred,
    externalIds: {
      ...secondary.externalIds,
      ...preferred.externalIds
    },
    authors: preferred.authors.length ? preferred.authors : secondary.authors,
    abstract: hasUsableAbstract(preferred) ? preferred.abstract : secondary.abstract,
    url: preferred.url !== "#" ? preferred.url : secondary.url,
    pdfUrl: preferred.pdfUrl || secondary.pdfUrl,
    isOpenAccess: preferred.isOpenAccess || secondary.isOpenAccess,
    isReviewArticle: preferred.isReviewArticle || secondary.isReviewArticle,
    citationCount: Math.max(preferred.citationCount || 0, secondary.citationCount || 0) || undefined,
    concepts: [...new Set([...preferred.concepts, ...secondary.concepts])],
    tags: [
      ...new Set([
        ...preferred.tags,
        ...secondary.tags,
        preferred.source !== secondary.source ? "Multiple sources" : null
      ].filter(Boolean) as string[])
    ],
    source: preferred.source
  };
}

function areLikelyDuplicates(left: ResearchArticle, right: ResearchArticle) {
  const leftDoi = left.externalIds.doi?.toLowerCase();
  const rightDoi = right.externalIds.doi?.toLowerCase();

  if (leftDoi && rightDoi && leftDoi === rightDoi) {
    return true;
  }

  const leftTitle = normalizeTitle(left.title);
  const rightTitle = normalizeTitle(right.title);

  if (leftTitle && rightTitle && leftTitle === rightTitle) {
    return true;
  }

  return titleSimilarity(left.title, right.title) >= 0.82;
}

// We merge across sources here so OpenAlex remains primary while still benefiting from backup metadata.
function deduplicateArticles(articles: ResearchArticle[]) {
  const merged: ResearchArticle[] = [];

  for (const article of articles) {
    const duplicateIndex = merged.findIndex((existing) => areLikelyDuplicates(existing, article));

    if (duplicateIndex === -1) {
      merged.push(article);
      continue;
    }

    merged[duplicateIndex] = mergeDuplicateArticles(merged[duplicateIndex], article);
  }

  return merged;
}

function truncateText(value: string, maxWords: number) {
  const words = value.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return value;
  return `${words.slice(0, maxWords).join(" ")}...`;
}

function abstractSentences(abstract: string) {
  if (!abstract || abstract === "Abstract unavailable.") return [];

  return abstract
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 24)
    .slice(0, 3);
}

function matchedTerms(article: ResearchArticle, query: string, relatedTerms: string[]) {
  const haystack = normalizeSearchText(
    `${article.title} ${article.abstract} ${article.concepts.join(" ")}`
  );
  const keywords = normalizeSearchText(`${query} ${relatedTerms.join(" ")}`)
    .split(/\s+/)
    .filter((term) => term.length > 3);

  return [...new Set(keywords.filter((term) => haystack.includes(term)))].slice(0, 4);
}

function buildUiMetadata(
  article: ResearchArticle,
  query: string,
  relatedTerms: string[]
): Partial<ResearchArticle> {
  const summarySentences = abstractSentences(article.abstract);
  const matches = matchedTerms(article, query, relatedTerms);
  const citationNote = article.citationCount
    ? `${article.citationCount} citations`
    : "limited citation metadata";
  const accessNote = article.isOpenAccess ? "open access" : "source-linked";
  const relevanceReason = matches.length
    ? `This paper is relevant because it matches terms like ${matches.join(", ")}, has ${citationNote}, and is ${accessNote}.`
    : `This paper is relevant because its title and abstract align with ${query}, it has ${citationNote}, and it is ${accessNote}.`;

  return {
    whyRelevant: article.whyRelevant || relevanceReason,
    plainEnglishSummary:
      article.plainEnglishSummary ||
      (summarySentences.length
        ? truncateText(summarySentences[0], 34)
        : "The search metadata did not include a full abstract, so open the original paper to inspect its main findings and methods."),
    keyFindings:
      article.keyFindings && article.keyFindings.length
        ? article.keyFindings
        : summarySentences.length
          ? summarySentences.slice(0, 2).map((sentence) => truncateText(sentence, 28))
          : [
              "The source appears closely aligned with the query based on title-level metadata.",
              "Open the full paper before citing detailed methods or conclusions."
            ],
    limitations:
      article.limitations && article.limitations.length
        ? article.limitations
        : [
            "This ranking is based on title, abstract, recency, citation count, and open-access metadata rather than full-text reading.",
            "Students should still inspect the full paper before making strong claims about methods or causation."
          ],
    suggestedUses:
      article.suggestedUses && article.suggestedUses.length
        ? article.suggestedUses
        : article.isReviewArticle
          ? [
              "Use it as a background or literature review source.",
              "Pair it with one newer primary study for a stronger argument."
            ]
          : [
              "Use it as a concrete empirical example in a body paragraph.",
              "Compare it with one broader review article when evaluating the topic."
            ],
    followUpTerms:
      article.followUpTerms && article.followUpTerms.length
        ? article.followUpTerms
        : [...new Set([...article.concepts.slice(0, 2), ...relatedTerms.slice(0, 2)])].slice(0, 4)
  };
}

async function collectAcademicResults(rewrite: QueryRewrite, query: string) {
  const openAlexRequests = await Promise.allSettled([
    fetchOpenAlex(rewrite.improvedQuery),
    rewrite.improvedQuery === query ? Promise.resolve([]) : fetchOpenAlex(query)
  ]);

  const semanticScholarRequest = await Promise.allSettled([
    fetchSemanticScholar(rewrite.improvedQuery)
  ]);

  const openAlexResults = openAlexRequests.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  );
  const semanticScholarResults = semanticScholarRequest.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  );

  return {
    openAlexResults,
    semanticScholarResults
  };
}

export async function runScholarSearch(
  query: string,
  partialFilters?: Partial<SearchFilters>
): Promise<SearchResponse> {
  const filters: SearchFilters = {
    ...DEFAULT_FILTERS,
    ...partialFilters
  };

  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return buildMockSearchResponse(
      "How does urban greening affect heat islands in dense cities?",
      filters
    );
  }

  const rewrite = rewriteAcademicQuery(trimmedQuery, filters.level);

  try {
    const resolvedRewrite = await rewrite;
    const { openAlexResults, semanticScholarResults } = await collectAcademicResults(
      resolvedRewrite,
      trimmedQuery
    );
    const combinedResults = deduplicateArticles([
      ...openAlexResults,
      ...semanticScholarResults
    ]);

    if (!combinedResults.length) {
      return buildMockSearchResponse(trimmedQuery, filters);
    }

    const rankedResults = scoreArticles(
      combinedResults,
      trimmedQuery,
      resolvedRewrite.relatedTerms,
      filters
    )
      .map((article) => ({
        ...article,
        ...buildUiMetadata(article, trimmedQuery, resolvedRewrite.relatedTerms)
      }))
      .slice(0, 10);
    const enrichedResults = await enrichArticlesWithAi(
      rankedResults,
      trimmedQuery,
      filters.level
    );

    return {
      query: trimmedQuery,
      rewrite: resolvedRewrite,
      filters,
      articles: enrichedResults,
      usedFallback: false,
      generatedAt: new Date().toISOString()
    };
  } catch {
    return buildMockSearchResponse(trimmedQuery, filters);
  }
}
