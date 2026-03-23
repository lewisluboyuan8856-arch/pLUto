import {
  buildSourceQualitySnapshot,
  describeSourceStrength,
  scoreSourceStrength
} from "@/lib/research-assistant/source-quality";
import { normalizeSearchText } from "@/lib/search/ranker";
import type { QueryRewrite, ResearchArticle, ResearchAssistantSourceQuality } from "@/lib/types";

export type ResultsOverviewHighlight = {
  id: string;
  label: string;
  reason: string;
  article: ResearchArticle;
  quality: ResearchAssistantSourceQuality;
};

export type ResultsOverview = {
  lead: string;
  confidenceLine: string;
  actionPlan: string[];
  coverageStats: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  highlights: ResultsOverviewHighlight[];
};

function topConcepts(articles: ResearchArticle[]) {
  const counts = new Map<string, number>();

  for (const article of articles) {
    for (const concept of article.concepts.slice(0, 4)) {
      const normalized = concept.trim();
      if (!normalized) continue;
      counts.set(normalized, (counts.get(normalized) || 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([concept]) => concept);
}

function citationValue(article: ResearchArticle) {
  return article.citationCount || 0;
}

function contrastSignal(article: ResearchArticle, anchor?: ResearchArticle) {
  const haystack = normalizeSearchText(
    `${article.title} ${article.plainEnglishSummary} ${article.whyRelevant} ${(article.limitations || []).join(" ")} ${(article.tags || []).join(" ")}`
  );
  let score = 0;

  if (
    /however|while|whereas|trade|tension|contrast|versus|vs|debate|risk|limit|qualif/.test(haystack)
  ) {
    score += 16;
  }

  score += (article.limitations?.length || 0) * 5;

  if (!article.isReviewArticle) {
    score += 8;
  }

  if (anchor && anchor.id !== article.id) {
    const anchorConcepts = new Set(anchor.concepts.map((concept) => normalizeSearchText(concept)));
    const overlap = article.concepts.filter((concept) =>
      anchorConcepts.has(normalizeSearchText(concept))
    ).length;

    score += Math.max(0, 10 - overlap * 3);
  }

  return score;
}

function pickArticle(
  articles: ResearchArticle[],
  usedIds: Set<string>,
  scoreArticle: (article: ResearchArticle) => number
) {
  const unused = articles.filter((article) => !usedIds.has(article.id));
  const pool = unused.length ? unused : articles;

  const article =
    [...pool].sort((left, right) => scoreArticle(right) - scoreArticle(left))[0] || articles[0];

  usedIds.add(article.id);
  return article;
}

function buildHighlightReason(label: string, article: ResearchArticle, quality: ResearchAssistantSourceQuality) {
  const strength = describeSourceStrength(quality.strengthScore);

  switch (label) {
    case "Best source for essay":
      return `${article.title} looks like the cleanest essay anchor because it combines strong topic match with ${quality.studentUsefulness.toLowerCase()}.`;
    case "Most reliable source":
      return `${article.title} stands out on the available metadata because ${strength.toLowerCase()}, ${quality.studyType.toLowerCase()}, and ${quality.citations.toLowerCase()}.`;
    case "Most beginner-friendly":
      return `${article.title} is the easiest place to start because it feels more student-readable, and ${quality.openAccess.toLowerCase()}.`;
    case "Best opposing viewpoint":
      return `${article.title} is the best source to complicate a one-sided argument based on metadata cues, but you should read the full paper to confirm its exact stance.`;
    default:
      return `${article.title} is the strongest recent pick if you need current evidence without giving up too much source quality.`;
  }
}

export function buildResultsOverview(query: string, rewrite: QueryRewrite, articles: ResearchArticle[]): ResultsOverview {
  if (!articles.length) {
    return {
      lead: `pLUto could not build a source brief for "${query}" because no papers matched the current filters.`,
      confidenceLine:
        "Try broadening the topic or removing one filter to let the overview and source picks populate.",
      actionPlan: [
        "Broaden the topic wording slightly.",
        "Turn off one filter to widen the evidence pool.",
        "Run the search again to build a stronger shortlist."
      ],
      coverageStats: [
        {
          label: "Topic coverage",
          value: rewrite.relatedTerms.slice(0, 3).join(" / ") || "n/a",
          detail: "Suggested directions from the rewritten query"
        },
        {
          label: "Review-style evidence",
          value: "0/0",
          detail: "No sources available yet"
        },
        {
          label: "Open access",
          value: "0/0",
          detail: "No sources available yet"
        },
        {
          label: "Most cited in set",
          value: "n/a",
          detail: "Citation metadata unavailable"
        }
      ],
      highlights: []
    };
  }

  const reviews = articles.filter((article) => article.isReviewArticle).length;
  const openAccess = articles.filter((article) => article.isOpenAccess).length;
  const accessible = articles.filter((article) => article.difficulty === "Accessible").length;
  const concepts = topConcepts(articles);
  const usedIds = new Set<string>();

  const essayArticle = pickArticle(articles, usedIds, (article) => {
    return article.relevanceScore * 0.52 + scoreSourceStrength(article) * 0.24 + (article.difficulty === "Accessible" ? 10 : 0) + (article.isReviewArticle ? 8 : 0);
  });

  const reliableArticle = pickArticle(articles, usedIds, (article) => {
    return scoreSourceStrength(article) * 0.7 + citationValue(article) * 0.05 + (article.isReviewArticle ? 18 : 0);
  });

  const beginnerArticle = pickArticle(articles, usedIds, (article) => {
    return (article.difficulty === "Accessible" ? 40 : article.difficulty === "Intermediate" ? 18 : 0) + (article.isOpenAccess ? 16 : 0) + article.relevanceScore * 0.18 + (article.isReviewArticle ? 8 : 0);
  });

  const opposingArticle = pickArticle(articles, usedIds, (article) => {
    return contrastSignal(article, essayArticle) + article.studentFitScore * 0.1 + (article.id === essayArticle.id ? -30 : 0);
  });

  const recentStrongArticle = pickArticle(articles, usedIds, (article) => {
    return (article.year || 0) * 0.12 + scoreSourceStrength(article) * 0.62 + article.relevanceScore * 0.18;
  });

  const highlights = [
    {
      id: "essay",
      label: "Best source for essay",
      article: essayArticle
    },
    {
      id: "reliable",
      label: "Most reliable source",
      article: reliableArticle
    },
    {
      id: "beginner",
      label: "Most beginner-friendly",
      article: beginnerArticle
    },
    {
      id: "opposing",
      label: "Best opposing viewpoint",
      article: opposingArticle
    },
    {
      id: "recent",
      label: "Most recent strong source",
      article: recentStrongArticle
    }
  ].map((item) => {
    const quality = buildSourceQualitySnapshot(item.article);

    return {
      ...item,
      quality,
      reason: buildHighlightReason(item.label, item.article, quality)
    };
  });

  const topCited = [...articles].sort((left, right) => citationValue(right) - citationValue(left))[0];
  const strongestCurrent = highlights.find((item) => item.id === "essay")?.article || articles[0];

  return {
    lead: `For "${query}", the shortlist leans toward ${concepts.length ? concepts.join(", ") : rewrite.relatedTerms.slice(0, 3).join(", ")}. Start with ${strongestCurrent.title} as your anchor, then use ${opposingArticle.title} to balance or evaluate the argument.`,
    confidenceLine: `This view is grounded in title, abstract, citation, recency, review-status, and access metadata. ${reviews} review-style source${reviews === 1 ? "" : "s"}, ${openAccess} open-access pick${openAccess === 1 ? "" : "s"}, and ${accessible} more student-friendly paper${accessible === 1 ? "" : "s"} surfaced in the current shortlist.`,
    actionPlan: [
      `Open ${essayArticle.title} first to frame the topic and lift core evidence.`,
      `Use ${reliableArticle.title} when you need the most defensible citation from this set.`,
      `Pair ${opposingArticle.title} with your main source if you want a balanced paragraph or evaluation section.`
    ],
    coverageStats: [
      {
        label: "Topic coverage",
        value: concepts.length ? concepts.join(" / ") : rewrite.relatedTerms.slice(0, 3).join(" / "),
        detail: "Most repeated ideas across the current shortlist"
      },
      {
        label: "Review-style evidence",
        value: `${reviews}/${articles.length}`,
        detail: "Helpful for background and synthesis"
      },
      {
        label: "Open access",
        value: `${openAccess}/${articles.length}`,
        detail: "Easier for students to verify directly"
      },
      {
        label: "Most cited in set",
        value: topCited?.citationCount ? `${topCited.citationCount}` : "n/a",
        detail: topCited ? topCited.title : "Citation metadata unavailable"
      }
    ],
    highlights
  };
}
