import OpenAI from "openai";

import { MOCK_QUERY_REWRITE } from "@/lib/constants";
import type { QueryRewrite, ResearchArticle } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";

let client: OpenAI | null = null;

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

function getOpenAiClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export async function rewriteAcademicQuery(
  query: string,
  level: string
): Promise<QueryRewrite> {
  const openai = getOpenAiClient();

  if (!openai) {
    return {
      improvedQuery: `${query} AND student outcomes OR academic performance`,
      relatedTerms: MOCK_QUERY_REWRITE.relatedTerms,
      intentSummary: `Student is researching ${query} at ${level} level and needs academically precise search framing.`
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are helping a research assistant app. Return JSON with improvedQuery, relatedTerms, and intentSummary. Keep search terms academically useful and concise."
        },
        {
          role: "user",
          content: `Topic: ${query}\nStudent level: ${level}\nReturn 4 related terms.`
        }
      ]
    });

    const content = response.choices[0]?.message?.content || "";
    return safeJsonParse<QueryRewrite>(content, {
      improvedQuery: `${query} AND academic literature`,
      relatedTerms: MOCK_QUERY_REWRITE.relatedTerms,
      intentSummary: MOCK_QUERY_REWRITE.intentSummary
    });
  } catch {
    return {
      improvedQuery: `${query} AND academic literature`,
      relatedTerms: MOCK_QUERY_REWRITE.relatedTerms,
      intentSummary: MOCK_QUERY_REWRITE.intentSummary
    };
  }
}

type ArticleAiResult = Pick<
  ResearchArticle,
  "whyRelevant" | "plainEnglishSummary" | "difficulty" | "keyFindings" | "limitations" | "suggestedUses" | "followUpTerms"
>;

function fallbackArticleAi(article: ResearchArticle, query: string): ArticleAiResult {
  const titleFocus = article.title.split(":")[0];
  return {
    whyRelevant: `This paper is a strong match for "${query}" because its title and abstract focus directly on ${titleFocus.toLowerCase()}.`,
    plainEnglishSummary:
      "This paper gives a usable explanation of the main idea, what the researchers studied, and what a student could reasonably cite in an essay or project.",
    difficulty:
      article.studentFitScore >= 85
        ? "Accessible"
        : article.studentFitScore >= 72
          ? "Intermediate"
          : "Advanced",
    keyFindings: [
      "The study addresses the student topic directly.",
      "It offers evidence or synthesis that can strengthen an argument."
    ],
    limitations: [
      "Students should still check the methodology before relying on it heavily.",
      "Context may vary across populations or study designs."
    ],
    suggestedUses: [
      "Use it to support a core body paragraph.",
      "Compare it with one broader review or meta-analysis."
    ],
    followUpTerms: article.concepts.slice(0, 2)
  };
}

export async function enrichArticlesWithAi(
  articles: ResearchArticle[],
  query: string,
  level: string
) {
  const openai = getOpenAiClient();

  if (!openai) {
    return articles.map((article) => ({ ...article, ...fallbackArticleAi(article, query) }));
  }

  return Promise.all(
    articles.map(async (article) => {
      try {
        const response = await openai.chat.completions.create({
          model: OPENAI_MODEL,
          temperature: 0.4,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "Return JSON with whyRelevant, plainEnglishSummary, difficulty, keyFindings, limitations, suggestedUses, followUpTerms. Keep language suitable for students."
            },
            {
              role: "user",
              content: `Student topic: ${query}\nStudent level: ${level}\nTitle: ${article.title}\nAbstract: ${article.abstract}\nJournal: ${article.journal || "Unknown"}`
            }
          ]
        });

        const content = response.choices[0]?.message?.content || "";
        return {
          ...article,
          ...safeJsonParse<ArticleAiResult>(content, fallbackArticleAi(article, query))
        };
      } catch {
        return {
          ...article,
          ...fallbackArticleAi(article, query)
        };
      }
    })
  );
}
