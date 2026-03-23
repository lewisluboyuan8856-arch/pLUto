import OpenAI from "openai";

import {
  buildSourceQualitySnapshots,
  scoreSourceStrength
} from "@/lib/research-assistant/source-quality";
import type {
  ResearchArticle,
  ResearchAssistantComparison,
  ResearchAssistantGrounding,
  ResearchAssistantMode,
  ResearchAssistantResponse,
  ResearchAssistantStudentOutputs
} from "@/lib/types";
import { normalizeSearchText } from "@/lib/search/ranker";
import { safeJsonParse } from "@/lib/utils";

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

let client: OpenAI | null = null;

type AssistantAiPayload = {
  answer?: string;
  comparison?: Partial<ResearchAssistantComparison>;
  studentOutputs?: Partial<ResearchAssistantStudentOutputs>;
  grounding?: Array<{
    articleId?: string;
    title?: string;
    evidenceNote?: string;
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

function trimParagraph(value: string, fallback: string) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned || fallback;
}

function matchedPromptTerms(article: ResearchArticle, prompt: string) {
  const promptTerms = normalizeSearchText(prompt)
    .split(/\s+/)
    .filter((term) => term.length > 3);
  const haystack = normalizeSearchText(
    `${article.title} ${article.abstract} ${article.whyRelevant} ${article.plainEnglishSummary} ${article.concepts.join(" ")}`
  );

  return promptTerms.filter((term) => haystack.includes(term));
}

function buildGroundingNotes(
  articles: ResearchArticle[],
  prompt: string
): ResearchAssistantGrounding[] {
  return articles.slice(0, 5).map((article) => {
    const matchedTerms = matchedPromptTerms(article, prompt).slice(0, 3);
    const evidenceNote = matchedTerms.length
      ? `Grounded in metadata and summaries matching ${matchedTerms.join(", ")}.`
      : `Grounded in the paper's title, summary, and relevance notes only.`;

    return {
      articleId: article.id,
      title: article.title,
      evidenceNote
    };
  });
}

function strongestArticle(articles: ResearchArticle[], prompt: string) {
  return [...articles].sort((left, right) => {
    const promptLiftLeft = matchedPromptTerms(left, prompt).length * 7;
    const promptLiftRight = matchedPromptTerms(right, prompt).length * 7;

    return (
      scoreSourceStrength(right) +
        promptLiftRight +
        (right.isReviewArticle ? 4 : 0) -
      (scoreSourceStrength(left) + promptLiftLeft + (left.isReviewArticle ? 4 : 0))
    );
  })[0];
}

function strongestPaperReason(article: ResearchArticle) {
  const reasons = [];

  if (article.isReviewArticle) {
    reasons.push("it appears to synthesize broader evidence");
  }

  if (article.citationCount) {
    reasons.push(`it has ${article.citationCount} citation${article.citationCount === 1 ? "" : "s"}`);
  }

  if (article.year) {
    reasons.push(`it is from ${article.year}`);
  }

  if (article.isOpenAccess) {
    reasons.push("it is easier for a student to verify because it is open access");
  }

  return reasons.length
    ? reasons.join(", ")
    : "it looks strongest on the available metadata and relevance signals";
}

function repeatedConcepts(articles: ResearchArticle[]) {
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
    .filter(([, count]) => count > 1)
    .slice(0, 3)
    .map(([concept]) => concept);
}

function buildEvidenceParagraph(articles: ResearchArticle[]) {
  const anchor = strongestArticle(articles, "");
  const supporting = articles.find((article) => article.id !== anchor.id) || anchor;
  const anchorFinding = anchor.keyFindings?.[0] || anchor.plainEnglishSummary;
  const supportingFinding = supporting.keyFindings?.[0] || supporting.plainEnglishSummary;

  return trimParagraph(
    `${anchor.title} provides the clearest anchor for this topic because ${anchorFinding.toLowerCase()}. ${supporting.title !== anchor.title ? `${supporting.title} adds support by showing that ${supportingFinding.toLowerCase()}. ` : ""}Together, these papers could be used to build a cautious evidence-based paragraph, but the exact wording of findings should still be verified in the full texts.`,
    "The selected papers can support a short evidence-based paragraph, but the exact claims should still be checked against the full papers."
  );
}

function buildStudentOutputs(articles: ResearchArticle[]): ResearchAssistantStudentOutputs {
  const anchor = strongestArticle(articles, "");
  const support = articles.find((article) => article.id !== anchor.id) || anchor;
  const repeated = repeatedConcepts(articles);

  return {
    comparisonParagraph: buildEvidenceParagraph(articles),
    researchNotes: trimParagraph(
      `${anchor.title} is the main anchor source because ${strongestPaperReason(anchor)}. ${support.title !== anchor.title ? `${support.title} is the best supporting comparison source for broadening or balancing the claim. ` : ""}${repeated.length ? `The most repeated themes across the selected papers are ${repeated.join(", ")}. ` : ""}Check full methods before citing any precise causal claim.`,
      "These selected papers give you a usable research-note summary, but you should still verify methods and exact claims in the full texts."
    ),
    usageNote: trimParagraph(
      `${anchor.title} is the best paper to lead an essay or project section, while the remaining sources are most useful for comparison, counterpoint, or evaluation depending on their metadata strength.`,
      "Use the strongest selected paper as your anchor, then use the rest for support, contrast, or evaluation."
    )
  };
}

function buildComparisonSections(articles: ResearchArticle[]): ResearchAssistantComparison {
  const reviewCount = articles.filter((article) => article.isReviewArticle).length;
  const openAccessCount = articles.filter((article) => article.isOpenAccess).length;
  const strongest = strongestArticle(articles, "");
  const nonReviewCount = articles.length - reviewCount;
  const repeated = repeatedConcepts(articles);

  return {
    researchQuestion:
      "These papers cluster around overlapping themes in the selected topic, but you should still read the full texts to confirm the exact wording of each paper's research question.",
    methodology:
      reviewCount
        ? `${reviewCount} selected paper(s) are review-style sources, while ${nonReviewCount} look like non-review papers or likely single studies based on metadata.`
        : "The selected set appears to lean toward non-review sources, so the evidence base may be more fragmented and paper-specific.",
    findings:
      `Across the selected set, the strongest recurring signals come from the titles, abstracts, and summaries rather than full-text extraction. ${openAccessCount} paper(s) are open access, which makes cross-checking easier.`,
    conclusions:
      "Taken together, these sources seem to point in the same general direction, but the confidence of that conclusion depends on how well the full methods and discussion sections align.",
    agreementMap:
      repeated.length
        ? `The clearest shared ground across the selected papers is around ${repeated.join(", ")}, although the exact strength of agreement still needs full-text checking.`
        : "The safest area of agreement is the overlap visible in the titles, abstracts, and summaries rather than a full-text consensus claim.",
    contradictions:
      reviewCount && nonReviewCount
        ? "The main tension is likely to come from scope rather than direct contradiction: review papers summarize broad trends, while the non-review papers may reflect narrower settings or samples."
        : "The metadata does not reveal a clean direct contradiction across these papers, so treat any disagreement as something to verify in the full texts.",
    limitations:
      "This comparison is grounded in metadata, summaries, and assistant-generated relevance notes. It should not be treated as a substitute for reading the methods and discussion sections.",
    strongestPaper: `${strongest.title} looks strongest because ${strongestPaperReason(strongest)}.`,
    bestForEssayProject:
      `${strongest.title} is the best main source for a school essay or project because it offers the strongest mix of metadata strength, relevance, and student usability.`,
    studentUsefulness:
      `${strongest.title} looks like the strongest anchor source for student work based on metadata strength, while the rest are most useful for comparison, background, or evaluation.`,
    evidenceParagraph: buildEvidenceParagraph(articles)
  };
}

function buildDefaultChatAnswer(prompt: string, articles: ResearchArticle[]) {
  const strongest = strongestArticle(articles, prompt);
  const matched = matchedPromptTerms(strongest, prompt).slice(0, 3);

  if (/agree|consensus|common/i.test(prompt)) {
    return "The selected papers point to overlapping themes, but the exact area of agreement should still be verified in the full texts. The safest common ground is what appears repeatedly in the titles, summaries, and relevance notes.";
  }

  if (/strongest|best|supports/i.test(prompt)) {
    return `${strongest.title} looks like the strongest fit for that question because it ranks well on review status, recency, citations, and topic match${matched.length ? `, especially around ${matched.join(", ")}` : ""}.`;
  }

  if (/weak|limitation|method/i.test(prompt)) {
    return "The main weakness is that metadata alone cannot fully confirm sampling, measurement quality, or causal design. Use the full methods sections before making a strong methodological claim.";
  }

  if (/essay|project|presentation|report/i.test(prompt)) {
    return `${strongest.title} is the most usable starting point for a student essay or project, and the remaining papers are best used to broaden context, compare evidence, or qualify the argument.`;
  }

  if (/simple|plain|summari/i.test(prompt)) {
    return `In simple terms, the selected papers point in a similar general direction, but you should still treat the answer as summary-level rather than full-text verified.`;
  }

  if (/note/i.test(prompt)) {
    return `The selected papers give you a workable research-note set, but the safest notes are still the ideas visible in the titles, summaries, and relevance explanations.`;
  }

  if (/paragraph|comparison paragraph/i.test(prompt)) {
    return `I can draft a short comparison paragraph from the selected papers, but the exact wording of findings should still be checked in the full texts before submission.`;
  }

  return `Based on the selected papers, ${strongest.title} is the clearest starting point for this question, but the answer should still be treated as metadata-grounded rather than full-text verified.`;
}

function fallbackAssistantResponse(
  mode: ResearchAssistantMode,
  prompt: string,
  articles: ResearchArticle[]
): ResearchAssistantResponse {
  const comparison = mode === "compare" ? buildComparisonSections(articles) : undefined;
  const studentOutputs = buildStudentOutputs(articles);
  const answer =
    mode === "compare"
      ? "This comparison is grounded in the selected papers' titles, abstracts, summaries, and metadata. Use it as a student-friendly synthesis, then open the strongest papers to verify methods and exact findings."
      : mode === "essay"
        ? studentOutputs.usageNote
        : buildDefaultChatAnswer(prompt, articles);

  return {
    mode,
    answer,
    comparison,
    studentOutputs,
    grounding: buildGroundingNotes(articles, prompt),
    sourceQuality: buildSourceQualitySnapshots(articles),
    usedFallback: true
  };
}

function sanitizeStudentOutputs(
  value: AssistantAiPayload["studentOutputs"],
  fallback: ResearchAssistantStudentOutputs
) {
  if (!value) {
    return fallback;
  }

  return {
    comparisonParagraph: trimParagraph(
      String(value.comparisonParagraph || ""),
      fallback.comparisonParagraph
    ),
    researchNotes: trimParagraph(String(value.researchNotes || ""), fallback.researchNotes),
    usageNote: trimParagraph(String(value.usageNote || ""), fallback.usageNote)
  };
}

function sanitizeComparison(value: AssistantAiPayload["comparison"], fallback?: ResearchAssistantComparison) {
  if (!value) {
    return fallback;
  }

  return {
    researchQuestion: trimParagraph(
      String(value.researchQuestion || ""),
      fallback?.researchQuestion || "The available metadata does not fully expose each paper's exact research question."
    ),
    methodology: trimParagraph(
      String(value.methodology || ""),
      fallback?.methodology || "The methodology comparison is limited to metadata and summary-level clues."
    ),
    findings: trimParagraph(
      String(value.findings || ""),
      fallback?.findings || "The findings summary is grounded in abstracts and summaries rather than full-text extraction."
    ),
    conclusions: trimParagraph(
      String(value.conclusions || ""),
      fallback?.conclusions || "The conclusion is based on what the supplied metadata suggests, not on full-text verification."
    ),
    agreementMap: trimParagraph(
      String(value.agreementMap || ""),
      fallback?.agreementMap || "The safest area of agreement comes from overlap in the supplied summaries and metadata."
    ),
    contradictions: trimParagraph(
      String(value.contradictions || ""),
      fallback?.contradictions || "Any contradiction should be treated cautiously unless it is visible in the provided summaries."
    ),
    limitations: trimParagraph(
      String(value.limitations || ""),
      fallback?.limitations || "These papers should still be checked in full before making precise methodological claims."
    ),
    strongestPaper: trimParagraph(
      String(value.strongestPaper || ""),
      fallback?.strongestPaper || "The strongest paper should be chosen by reading the full text, not metadata alone."
    ),
    bestForEssayProject: trimParagraph(
      String(value.bestForEssayProject || ""),
      fallback?.bestForEssayProject || "Choose the strongest paper as your main essay or project source, then support it with additional comparison sources."
    ),
    studentUsefulness: trimParagraph(
      String(value.studentUsefulness || ""),
      fallback?.studentUsefulness || "Use the selected papers as a mix of background, evidence, and evaluation depending on their strength."
    ),
    evidenceParagraph: trimParagraph(
      String(value.evidenceParagraph || ""),
      fallback?.evidenceParagraph || "A short evidence-based paragraph can be drafted from these sources, but the exact evidence should be verified in the full papers."
    )
  };
}

function sanitizeGrounding(
  value: AssistantAiPayload["grounding"],
  articles: ResearchArticle[],
  prompt: string
) {
  if (!Array.isArray(value) || !value.length) {
    return buildGroundingNotes(articles, prompt);
  }

  const articleById = new Map(articles.map((article) => [article.id, article]));

  return value
    .map((item) => {
      const article = articleById.get(String(item.articleId || ""));
      if (!article) {
        return null;
      }

      return {
        articleId: article.id,
        title: item.title?.trim() || article.title,
        evidenceNote: trimParagraph(
          String(item.evidenceNote || ""),
          "Grounded in the selected paper metadata and summaries."
        )
      };
    })
    .filter(Boolean) as ResearchAssistantGrounding[];
}

export async function runResearchAssistant(
  mode: ResearchAssistantMode,
  prompt: string,
  articles: ResearchArticle[]
): Promise<ResearchAssistantResponse> {
  const openai = getOpenAiClient();
  const normalizedPrompt = prompt.trim();
  const fallback = fallbackAssistantResponse(mode, normalizedPrompt, articles);

  if (!openai || !articles.length) {
    return fallback;
  }

  try {
    const payload = {
      mode,
      prompt: normalizedPrompt,
      articles: articles.map((article) => ({
        id: article.id,
        title: article.title,
        authors: article.authors,
        year: article.year,
        journal: article.journal,
        abstract: article.abstract,
        plainEnglishSummary: article.plainEnglishSummary,
        whyRelevant: article.whyRelevant,
        keyFindings: article.keyFindings || [],
        limitations: article.limitations || [],
        suggestedUses: article.suggestedUses || [],
        concepts: article.concepts,
        isReviewArticle: article.isReviewArticle,
        isOpenAccess: article.isOpenAccess,
        citationCount: article.citationCount,
        difficulty: article.difficulty
      })),
      sourceQuality: fallback.sourceQuality
    };

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are pLUto's research copilot. You must answer only from the supplied paper metadata, summaries, and source-quality notes. Do not invent methods, findings, contradictions, or certainty beyond what is provided. Return JSON with answer, comparison, studentOutputs, and grounding. comparison should be included only for compare mode and must contain researchQuestion, methodology, findings, conclusions, agreementMap, contradictions, limitations, strongestPaper, bestForEssayProject, studentUsefulness, and evidenceParagraph. studentOutputs must always contain comparisonParagraph, researchNotes, and usageNote written for a student. grounding must be an array of articleId, title, and evidenceNote entries showing exactly which selected papers support the answer."
        },
        {
          role: "user",
          content: JSON.stringify(payload)
        }
      ]
    });

    const content = stripCodeFences(response.choices[0]?.message?.content || "");
    const parsed = safeJsonParse<AssistantAiPayload>(content, {});

    return {
      mode,
      answer: trimParagraph(parsed.answer || "", fallback.answer),
      comparison:
        mode === "compare"
          ? sanitizeComparison(parsed.comparison, fallback.comparison)
          : undefined,
      studentOutputs: sanitizeStudentOutputs(parsed.studentOutputs, fallback.studentOutputs),
      grounding: sanitizeGrounding(parsed.grounding, articles, normalizedPrompt),
      sourceQuality: fallback.sourceQuality,
      usedFallback: false
    };
  } catch {
    return fallback;
  }
}
