import OpenAI from "openai";

import { rewriteAcademicQueryDeterministic } from "@/lib/search/query-rewrite";
import type { QueryRewrite, ResearchArticle, StudentLevel } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";

let client: OpenAI | null = null;

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

type ArticleAiPayload = {
  items: Array<{
    id: string;
    plainEnglishSummary: string;
    whyRelevant: string;
  }>;
};

function getOpenAiClient() {
  if (!process.env.OPENAI_API_KEY) return null;

  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return client;
}

function stripCodeFences(value: string) {
  return value.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

function normalizeSentence(value: string, fallback: string, maxWords: number) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned) return fallback;

  const words = cleaned.split(" ").filter(Boolean);
  const truncated =
    words.length > maxWords ? `${words.slice(0, maxWords).join(" ")}.` : cleaned;

  return /[.!?]$/.test(truncated) ? truncated : `${truncated}.`;
}

function normalizeRelatedTerms(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const terms = [...new Set(value.map((item) => String(item || "").trim()).filter(Boolean))];
  return terms.length ? terms.slice(0, 4) : fallback;
}

function sanitizeRewrite(value: unknown, fallback: QueryRewrite): QueryRewrite {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const candidate = value as Partial<QueryRewrite>;

  return {
    improvedQuery:
      String(candidate.improvedQuery || "").trim() || fallback.improvedQuery,
    relatedTerms: normalizeRelatedTerms(candidate.relatedTerms, fallback.relatedTerms),
    intentSummary:
      normalizeSentence(String(candidate.intentSummary || ""), fallback.intentSummary, 28)
  };
}

function buildFallbackSummary(article: ResearchArticle) {
  const firstSentence = article.abstract
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .find((sentence) => sentence && sentence !== "Abstract unavailable.");

  return normalizeSentence(
    firstSentence || "",
    "The available metadata suggests this paper is relevant, but you should open the full article to confirm the exact methods and conclusions.",
    30
  );
}

function buildFallbackWhyRelevant(article: ResearchArticle, query: string) {
  const keywordHint = article.concepts.length
    ? `because it overlaps with ${article.concepts.slice(0, 2).join(" and ")}`
    : `because its title aligns closely with ${query}`;
  const accessHint = article.isOpenAccess ? "and it is open access" : "and it links to a citable source";

  return normalizeSentence(
    `This paper is relevant ${keywordHint}, ${accessHint}, and it ranked well on recency and citation signals.`,
    `This paper is relevant because it aligns closely with ${query} and surfaced strongly in the ranking.`,
    28
  );
}

function fallbackArticleNarratives(articles: ResearchArticle[], query: string) {
  return articles.map((article) => ({
    ...article,
    plainEnglishSummary: normalizeSentence(
      article.plainEnglishSummary,
      buildFallbackSummary(article),
      30
    ),
    whyRelevant: normalizeSentence(
      article.whyRelevant,
      buildFallbackWhyRelevant(article, query),
      26
    )
  }));
}

export async function rewriteAcademicQuery(
  query: string,
  level: StudentLevel
): Promise<QueryRewrite> {
  const fallback = rewriteAcademicQueryDeterministic(query, level);
  const openai = getOpenAiClient();

  if (!openai) {
    return fallback;
  }

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You help a student research assistant rewrite search queries. Return JSON with improvedQuery, relatedTerms, and intentSummary. Keep improvedQuery concise and optimized for academic search. Return exactly 4 relatedTerms."
        },
        {
          role: "user",
          content: `Topic: ${query}\nStudent level: ${level}\nReturn a stronger academic search phrase, four related search terms, and a short explanation of the search intent.`
        }
      ]
    });

    const content = stripCodeFences(response.choices[0]?.message?.content || "");
    return sanitizeRewrite(safeJsonParse<unknown>(content, fallback), fallback);
  } catch {
    return fallback;
  }
}

function sanitizeArticlePayload(
  value: unknown,
  fallbackArticles: ResearchArticle[],
  query: string
) {
  if (!value || typeof value !== "object" || !Array.isArray((value as ArticleAiPayload).items)) {
    return fallbackArticleNarratives(fallbackArticles, query);
  }

  const fallbackById = new Map(
    fallbackArticleNarratives(fallbackArticles, query).map((article) => [article.id, article])
  );
  const aiById = new Map(
    (value as ArticleAiPayload).items
      .map((item) => ({
        id: String(item?.id || ""),
        plainEnglishSummary: String(item?.plainEnglishSummary || ""),
        whyRelevant: String(item?.whyRelevant || "")
      }))
      .filter((item) => item.id)
      .map((item) => [item.id, item] as const)
  );

  return fallbackArticles.map((article) => {
    const fallbackArticle = fallbackById.get(article.id) || article;
    const aiArticle = aiById.get(article.id);

    if (!aiArticle) {
      return fallbackArticle;
    }

    return {
      ...fallbackArticle,
      plainEnglishSummary: normalizeSentence(
        aiArticle.plainEnglishSummary,
        fallbackArticle.plainEnglishSummary,
        32
      ),
      whyRelevant: normalizeSentence(
        aiArticle.whyRelevant,
        fallbackArticle.whyRelevant,
        26
      )
    };
  });
}

export async function enrichArticlesWithAi(
  articles: ResearchArticle[],
  query: string,
  level: StudentLevel
) {
  const openai = getOpenAiClient();
  const fallbackArticles = fallbackArticleNarratives(articles, query);

  if (!openai || !articles.length) {
    return fallbackArticles;
  }

  try {
    const articlePayload = articles.map((article) => ({
      id: article.id,
      title: article.title,
      abstract: article.abstract,
      year: article.year,
      journal: article.journal,
      concepts: article.concepts.slice(0, 4),
      isOpenAccess: article.isOpenAccess,
      citationCount: article.citationCount
    }));

    // Batch enrichment keeps latency reasonable while preserving deterministic fallbacks.
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You help students understand academic papers. Return JSON with an items array. Each item must include id, plainEnglishSummary, and whyRelevant. plainEnglishSummary should be one short plain-English sentence. whyRelevant should be one short sentence explaining why the paper matches the student's topic."
        },
        {
          role: "user",
          content: JSON.stringify({
            topic: query,
            studentLevel: level,
            items: articlePayload
          })
        }
      ]
    });

    const content = stripCodeFences(response.choices[0]?.message?.content || "");
    const parsed = safeJsonParse<unknown>(content, { items: [] });

    return sanitizeArticlePayload(parsed, articles, query);
  } catch {
    return fallbackArticles;
  }
}
