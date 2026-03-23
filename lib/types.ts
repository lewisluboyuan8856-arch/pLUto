export type StudentLevel = "Secondary" | "JC-IB" | "Undergraduate";

export type SortMode = "relevant" | "recent";

export type SearchFilters = {
  level: StudentLevel;
  sort: SortMode;
  openAccessOnly: boolean;
  reviewOnly: boolean;
};

export type QueryRewrite = {
  improvedQuery: string;
  relatedTerms: string[];
  intentSummary: string;
};

export type ResearchArticle = {
  id: string;
  externalIds: {
    doi?: string;
    semanticScholarId?: string;
    openAlexId?: string;
  };
  title: string;
  authors: string[];
  year?: number;
  journal?: string;
  abstract: string;
  url: string;
  pdfUrl?: string;
  isOpenAccess: boolean;
  isReviewArticle: boolean;
  citationCount?: number;
  source: "Semantic Scholar" | "OpenAlex" | "Mock";
  concepts: string[];
  relevanceScore: number;
  studentFitScore: number;
  recencyScore: number;
  whyRelevant: string;
  plainEnglishSummary: string;
  difficulty: "Accessible" | "Intermediate" | "Advanced";
  tags: string[];
  limitations?: string[];
  keyFindings?: string[];
  suggestedUses?: string[];
  followUpTerms?: string[];
};

export type SearchResponse = {
  query: string;
  rewrite: QueryRewrite;
  filters: SearchFilters;
  articles: ResearchArticle[];
  usedFallback: boolean;
  generatedAt: string;
};

export type BrowserSavedPaper = {
  articleId: string;
  article: ResearchArticle;
  note: string;
  savedAt: string;
};

export type SavedPaperRecord = {
  id: string;
  user_id: string;
  article_id: string;
  article_payload?: ResearchArticle | null;
  title: string;
  authors: string[];
  year?: number;
  journal?: string;
  article_url: string;
  citation_apa: string;
  citation_mla: string;
  why_relevant: string;
  summary: string;
  difficulty: string;
  tags: string[];
  created_at: string;
  note?: {
    id: string;
    content: string;
  } | null;
};

export type ResearchAssistantMode = "compare" | "chat" | "essay";

export type ResearchAssistantGrounding = {
  articleId: string;
  title: string;
  evidenceNote: string;
};

export type ResearchAssistantComparison = {
  researchQuestion: string;
  methodology: string;
  findings: string;
  conclusions: string;
  agreementMap: string;
  contradictions: string;
  limitations: string;
  strongestPaper: string;
  bestForEssayProject: string;
  studentUsefulness: string;
  evidenceParagraph: string;
};

export type ResearchAssistantStudentOutputs = {
  comparisonParagraph: string;
  researchNotes: string;
  usageNote: string;
};

export type ResearchAssistantSourceQuality = {
  articleId: string;
  title: string;
  studyType: string;
  recency: string;
  citations: string;
  openAccess: string;
  studentUsefulness: string;
  suggestedRole: "Background" | "Evidence" | "Counterargument" | "Evaluation";
  confidenceNote: string;
  strengthScore: number;
};

export type ResearchAssistantResponse = {
  mode: ResearchAssistantMode;
  answer: string;
  comparison?: ResearchAssistantComparison;
  studentOutputs: ResearchAssistantStudentOutputs;
  grounding: ResearchAssistantGrounding[];
  sourceQuality: ResearchAssistantSourceQuality[];
  usedFallback: boolean;
};

export type ResearchAssistantSelection = {
  article: ResearchArticle;
  selectedAt: string;
};
