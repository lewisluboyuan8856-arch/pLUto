import type { ResearchArticle } from "@/lib/types";
import { slugify } from "@/lib/utils";

type SemanticScholarAuthor = {
  name: string;
};

type SemanticScholarPaper = {
  paperId: string;
  title: string;
  abstract?: string;
  year?: number;
  venue?: string;
  url?: string;
  openAccessPdf?: { url?: string } | null;
  isOpenAccess?: boolean;
  publicationTypes?: string[];
  fieldsOfStudy?: string[];
  citationCount?: number;
  externalIds?: { DOI?: string };
  authors?: SemanticScholarAuthor[];
};

type OpenAlexWork = {
  id: string;
  doi?: string | null;
  title: string;
  publication_year?: number;
  primary_location?: {
    landing_page_url?: string | null;
    pdf_url?: string | null;
    source?: { display_name?: string | null } | null;
  } | null;
  open_access?: {
    is_oa?: boolean;
    oa_url?: string | null;
  } | null;
  authorships?: Array<{
    author?: {
      display_name?: string | null;
    } | null;
  }>;
  abstract_inverted_index?: Record<string, number[]>;
  concepts?: Array<{ display_name: string }>;
  type?: string;
  cited_by_count?: number;
};

function rebuildOpenAlexAbstract(index?: Record<string, number[]>) {
  if (!index) return "";

  const tokens: Array<{ word: string; position: number }> = [];
  for (const [word, positions] of Object.entries(index)) {
    for (const position of positions) {
      tokens.push({ word, position });
    }
  }

  return tokens
    .sort((left, right) => left.position - right.position)
    .map((token) => token.word)
    .join(" ");
}

function normalizeAbstract(abstract?: string) {
  const cleaned = abstract?.replace(/\s+/g, " ").trim() || "";
  return cleaned || "Abstract unavailable.";
}

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    next: {
      revalidate: 60 * 15
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchSemanticScholar(query: string): Promise<ResearchArticle[]> {
  const fields = [
    "paperId",
    "title",
    "abstract",
    "year",
    "venue",
    "url",
    "openAccessPdf",
    "isOpenAccess",
    "publicationTypes",
    "fieldsOfStudy",
    "citationCount",
    "externalIds",
    "authors"
  ].join(",");

  const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
  const url =
    `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}` +
    `&limit=8&fields=${fields}`;
  const data = await fetchJson<{ data: SemanticScholarPaper[] }>(url, {
    headers: apiKey ? { "x-api-key": apiKey } : undefined
  });

  return data.data
    .filter((paper) => paper.title)
    .map((paper) => ({
      id: paper.paperId || slugify(paper.title),
      externalIds: {
        doi: paper.externalIds?.DOI,
        semanticScholarId: paper.paperId
      },
      title: paper.title,
      authors: (paper.authors || []).map((author) => author.name).filter(Boolean),
      year: paper.year,
      journal: paper.venue || undefined,
      abstract: normalizeAbstract(paper.abstract),
      url: paper.url || paper.openAccessPdf?.url || "#",
      pdfUrl: paper.openAccessPdf?.url || undefined,
      isOpenAccess: Boolean(paper.isOpenAccess || paper.openAccessPdf?.url),
      isReviewArticle: /review|meta/i.test(
        `${paper.title} ${(paper.publicationTypes || []).join(" ")}`
      ),
      citationCount: paper.citationCount,
      source: "Semantic Scholar",
      concepts: paper.fieldsOfStudy || [],
      relevanceScore: 0,
      studentFitScore: 0,
      recencyScore: 0,
      whyRelevant: "",
      plainEnglishSummary: "",
      difficulty: "Intermediate",
      tags: []
    }));
}

export async function fetchOpenAlex(query: string): Promise<ResearchArticle[]> {
  const mailTo = process.env.OPENALEX_MAILTO;
  const url =
    `https://api.openalex.org/works?search=${encodeURIComponent(query)}` +
    `&per-page=12&select=id,doi,title,publication_year,primary_location,open_access,authorships,abstract_inverted_index,concepts,type,cited_by_count` +
    (mailTo ? `&mailto=${encodeURIComponent(mailTo)}` : "");

  const data = await fetchJson<{ results: OpenAlexWork[] }>(url);

  return data.results
    .filter((work) => work.title)
    .map((work) => ({
      id: work.id.replace("https://openalex.org/", ""),
      externalIds: {
        doi: work.doi?.replace("https://doi.org/", ""),
        openAlexId: work.id
      },
      title: work.title,
      authors: (work.authorships || [])
        .map((authorship) => authorship.author?.display_name || "")
        .filter(Boolean),
      year: work.publication_year,
      journal: work.primary_location?.source?.display_name || undefined,
      abstract: normalizeAbstract(rebuildOpenAlexAbstract(work.abstract_inverted_index)),
      url:
        work.primary_location?.landing_page_url ||
        work.open_access?.oa_url ||
        work.doi ||
        work.id,
      pdfUrl: work.primary_location?.pdf_url || work.open_access?.oa_url || undefined,
      isOpenAccess: Boolean(work.open_access?.is_oa),
      isReviewArticle: /review|meta-analysis|meta analysis|systematic review/i.test(
        `${work.title} ${work.type || ""}`
      ),
      citationCount: work.cited_by_count,
      source: "OpenAlex",
      concepts: (work.concepts || []).map((concept) => concept.display_name),
      relevanceScore: 0,
      studentFitScore: 0,
      recencyScore: 0,
      whyRelevant: "",
      plainEnglishSummary: "",
      difficulty: "Intermediate",
      tags: []
    }));
}
