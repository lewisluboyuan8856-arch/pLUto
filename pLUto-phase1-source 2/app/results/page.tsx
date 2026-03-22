import { AlertCircle, Sparkles } from "lucide-react";

import { ArticleCard } from "@/components/results/article-card";
import { SearchForm } from "@/components/search/search-form";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_FILTERS } from "@/lib/constants";
import { runScholarSearch } from "@/lib/search/pipeline";
import type { SearchFilters } from "@/lib/types";

type ResultsPageProps = {
  searchParams: {
    topic?: string;
    level?: SearchFilters["level"];
    sort?: SearchFilters["sort"];
    openAccess?: string;
    reviewOnly?: string;
  };
};

export const metadata = {
  title: "Results"
};

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const topic = searchParams.topic || "social media and attention in students";
  const filters: SearchFilters = {
    level: searchParams.level || DEFAULT_FILTERS.level,
    sort: searchParams.sort || DEFAULT_FILTERS.sort,
    openAccessOnly: searchParams.openAccess === "true",
    reviewOnly: searchParams.reviewOnly === "true"
  };

  const results = await runScholarSearch(topic, filters);
  const openAccessCount = results.articles.filter((article) => article.isOpenAccess).length;
  const reviewCount = results.articles.filter((article) => article.isReviewArticle).length;
  const articlesWithYear = results.articles.filter((article) => article.year);
  const averageYear = articlesWithYear.length
    ? Math.round(
        articlesWithYear.reduce((sum, article) => sum + (article.year || 0), 0) /
          articlesWithYear.length
      )
    : null;

  return (
    <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      <div className="space-y-6">
        <Badge>Mock-ranked results</Badge>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="max-w-4xl font-display text-5xl text-ink">
              Results for &ldquo;{results.query}&rdquo;
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-ink/65">
              The current phase uses a curated research library to simulate rewritten queries,
              ranking, summaries, and save flows before live APIs are connected.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
            <AlertCircle className="h-4 w-4" />
            Phase 1 mock mode is active. No external APIs or auth are required to use this flow.
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card">
        <SearchForm initialTopic={results.query} initialFilters={filters} compact />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/40">
            Rewritten academic query
          </p>
          <p className="mt-3 text-lg font-medium text-ink">{results.rewrite.improvedQuery}</p>
          <p className="mt-4 text-sm leading-7 text-ink/65">{results.rewrite.intentSummary}</p>
        </div>
        <div className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-coral" />
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/40">
              Related search terms
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {results.rewrite.relatedTerms.map((term) => (
              <Badge key={term}>{term}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-ink/10 bg-white p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">Open access</p>
          <p className="mt-3 font-display text-4xl text-ink">{openAccessCount}</p>
        </div>
        <div className="rounded-[1.5rem] border border-ink/10 bg-white p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">Review articles</p>
          <p className="mt-3 font-display text-4xl text-ink">{reviewCount}</p>
        </div>
        <div className="rounded-[1.5rem] border border-ink/10 bg-white p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">Average year</p>
          <p className="mt-3 font-display text-4xl text-ink">{averageYear ?? "n/a"}</p>
        </div>
      </div>

      <div className="mt-10 space-y-6">
        {results.articles.length ? (
          results.articles.map((article) => <ArticleCard key={article.id} article={article} />)
        ) : (
          <div className="rounded-[2rem] border border-dashed border-ink/15 bg-white p-10 text-center">
            <h2 className="font-display text-3xl text-ink">No results matched those filters.</h2>
            <p className="mt-3 text-sm text-ink/60">
              Try broadening the topic, turning off one filter, or switching the level.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
