import type { SearchFilters, StudentLevel } from "@/lib/types";

export const DEFAULT_LEVEL: StudentLevel = "JC-IB";

export const DEFAULT_FILTERS: SearchFilters = {
  level: DEFAULT_LEVEL,
  sort: "relevant",
  openAccessOnly: false,
  reviewOnly: false
};

export const LEVEL_OPTIONS: StudentLevel[] = [
  "Secondary",
  "JC-IB",
  "Undergraduate"
];

export const APP_NAME = "pLUto";
export const APP_TAGLINE = "An AI-powered research assistant for students";
export const MOCK_MODE_LABEL = "Live search + resilient fallback";

export const MOCK_QUERY_REWRITE = {
  improvedQuery:
    "cognitive effects of social media use in adolescents AND attention span OR executive function",
  relatedTerms: [
    "digital distraction in teenagers",
    "social media multitasking",
    "adolescent executive function",
    "attention regulation and screen time"
  ],
  intentSummary:
    "Looking for academically credible sources that connect a student topic to mechanisms, evidence quality, and likely essay angles."
};
