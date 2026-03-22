import type { QueryRewrite, StudentLevel } from "@/lib/types";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "in",
  "into",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "their",
  "this",
  "to",
  "what",
  "which",
  "with"
]);

type ExpansionRule = {
  pattern: RegExp;
  terms: string[];
};

const EXPANSION_RULES: ExpansionRule[] = [
  {
    pattern: /(effect|affect|impact|influence|relationship|link|associated)/i,
    terms: ["outcomes", "mechanisms", "evidence"]
  },
  {
    pattern: /(ethic|moral|fair|govern|policy|regulat|trust)/i,
    terms: ["ethics", "governance", "policy", "public trust"]
  },
  {
    pattern: /(urban|heat|temperature|climate|cool|greening)/i,
    terms: ["urban climate", "mitigation", "thermal comfort"]
  },
  {
    pattern: /(gene|crispr|crop|agricult|biotech)/i,
    terms: ["food security", "precision breeding", "regulation"]
  },
  {
    pattern: /(social|screen|phone|attention|learning|student)/i,
    terms: ["student outcomes", "cognitive effects", "learning"]
  },
  {
    pattern: /(plastic|microplastic|marine|ocean|food chain|trophic)/i,
    terms: ["trophic transfer", "bioaccumulation", "marine ecology"]
  }
];

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function uniqueTerms(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function extractKeywords(query: string) {
  return uniqueTerms(
    normalizeText(query)
      .split(/\s+/)
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
  );
}

function getExpansionTerms(query: string) {
  const matchedTerms = EXPANSION_RULES.flatMap((rule) =>
    rule.pattern.test(query) ? rule.terms : []
  );

  return uniqueTerms(matchedTerms).slice(0, 4);
}

function buildRelatedTerms(keywords: string[], expansionTerms: string[]) {
  const related = [
    keywords.slice(0, 2).join(" "),
    keywords.slice(0, 3).join(" "),
    expansionTerms[0],
    expansionTerms[1],
    `${keywords.slice(0, 2).join(" ")} review`,
    `${keywords.slice(0, 2).join(" ")} study`,
    `${keywords[0] || "research"} literature review`,
    `${keywords[keywords.length - 1] || "topic"} analysis`
  ];

  return uniqueTerms(related)
    .filter((term) => term.split(" ").length <= 5)
    .slice(0, 4);
}

export function rewriteAcademicQueryDeterministic(
  query: string,
  level: StudentLevel
): QueryRewrite {
  const keywords = extractKeywords(query);
  const expansionTerms = getExpansionTerms(query);
  const improvedQueryTerms = uniqueTerms([
    ...keywords.slice(0, 6),
    ...expansionTerms,
    "study",
    "review"
  ]).slice(0, 9);

  return {
    improvedQuery: improvedQueryTerms.join(" "),
    relatedTerms: buildRelatedTerms(keywords, expansionTerms),
    intentSummary: `Looking for academically credible sources on ${query} for ${level} students, with stronger emphasis on evidence quality, useful background papers, and concrete studies.`
  };
}

export const rewriteAcademicQuery = rewriteAcademicQueryDeterministic;
