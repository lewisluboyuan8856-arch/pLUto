import type { Metadata } from "next";
import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

import { AssistantLaunchBar } from "@/components/research-assistant/assistant-launch-bar";
import { ArticleCard } from "@/components/results/article-card";
import { ResultsOverviewPanel } from "@/components/results/results-overview-panel";
import { SearchForm } from "@/components/search/search-form";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_FILTERS } from "@/lib/constants";
import { runScholarSearch } from "@/lib/search/pipeline";
import { buildResultsOverview } from "@/lib/search/results-overview";
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

export const metadata: Metadata = {
  title: "Results",
  robots: {
    index: false,
    follow: false
  }
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
  const overview = results.articles.length
    ? buildResultsOverview(results.query, results.rewrite, results.articles)
    : null;
  const spotlightLabels = overview
    ? results.articles.reduce((map, article) => {
        map[article.id] = overview.highlights
          .filter((highlight) => highlight.article.id === article.id)
          .map((highlight) => highlight.label);
        return map;
      }, {} as Record<string, string[]>)
    : {};

  return (
    <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      <div className="space-y-6">
        <Badge>{results.usedFallback ? "Fallback results" : "Live-ranked results"}</Badge>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="max-w-4xl font-display text-5xl text-ink">
              Results for &ldquo;{results.query}&rdquo;
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-ink/65">
              {results.usedFallback
                ? "Live academic search was unavailable for this request, so pLUto fell back to its built-in library without breaking the workflow."
                : "These results were pulled from live academic metadata, normalized into one shared article shape, deduplicated, and ranked for usefulness."}
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-3 rounded-full px-4 py-3 text-sm ${
              results.usedFallback
                ? "border border-coral/20 bg-coral/10 text-coral"
                : "border border-sage/25 bg-sage/12 text-[#45614b]"
            }`}
          >
            <AlertCircle className="h-4 w-4" />
            {results.usedFallback
              ? "Fallback mode is active. The UI still works locally even if OpenAlex or Semantic Scholar is unavailable."
              : "OpenAlex is active as the primary source. Semantic Scholar is merged in when available."}
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

      <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-4">
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
        <div className="rounded-[1.5rem] border border-ink/10 bg-white p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">AI overview mode</p>
          <p className="mt-3 flex items-center gap-2 text-lg font-semibold text-ink">
            <CheckCircle2 className="h-5 w-5 text-sage" />
            Metadata-grounded
          </p>
        </div>
      </div>

      {results.articles.length ? (
        <>
          <div className="mt-10">
            <ResultsOverviewPanel
              query={results.query}
              rewrite={results.rewrite}
              articles={results.articles}
            />
          </div>

          <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              {results.articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  spotlightLabels={spotlightLabels[article.id]}
                />
              ))}
            </div>

            <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
              <AssistantLaunchBar variant="dashboard" />

              <div className="rounded-[1.9rem] border border-ink/10 bg-white p-6 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/42">
                  Reading strategy
                </p>
                <div className="mt-4 space-y-4">
                  {overview?.actionPlan.map((step, index) => (
                    <div key={step} className="rounded-[1.35rem] bg-paper p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">
                        Move 0{index + 1}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-ink/72">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.9rem] border border-ink/10 bg-white p-6 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/42">
                  Source quality guide
                </p>
                <div className="mt-4 space-y-3 text-sm leading-7 text-ink/68">
                  <p>Review or meta-analysis papers are stronger for background and evaluation.</p>
                  <p>Higher citations can suggest influence, but newer papers may have fewer citations simply because they are recent.</p>
                  <p>Open access makes it easier to verify claims directly before citing them in an essay or report.</p>
                </div>
              </div>
            </aside>
          </div>
        </>
      ) : (
        <div className="mt-10 rounded-[2rem] border border-dashed border-ink/15 bg-white p-10 text-center">
          <h2 className="font-display text-3xl text-ink">No results matched those filters.</h2>
          <p className="mt-3 text-sm text-ink/60">
            Try broadening the topic, turning off one filter, or switching the level.
          </p>
        </div>
      )}
    </div>
  );
}
