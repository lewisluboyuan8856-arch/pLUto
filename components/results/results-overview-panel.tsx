import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  Clock3,
  GraduationCap,
  type LucideIcon,
  ShieldCheck,
  Sparkles,
  SplitSquareVertical
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buildResultsOverview } from "@/lib/search/results-overview";
import type { QueryRewrite, ResearchArticle } from "@/lib/types";
import { formatAuthors } from "@/lib/utils";

const HIGHLIGHT_ICONS: Record<string, LucideIcon> = {
  "Best source for essay": BookMarked,
  "Most reliable source": ShieldCheck,
  "Most beginner-friendly": GraduationCap,
  "Best opposing viewpoint": SplitSquareVertical,
  "Most recent strong source": Clock3
};

type ResultsOverviewPanelProps = {
  query: string;
  rewrite: QueryRewrite;
  articles: ResearchArticle[];
};

export function ResultsOverviewPanel({
  query,
  rewrite,
  articles
}: ResultsOverviewPanelProps) {
  const overview = buildResultsOverview(query, rewrite, articles);

  return (
    <section className="surface-border rounded-[2.3rem] bg-white/85 p-[1px] shadow-glow">
      <div className="rounded-[2.25rem] bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(239,235,227,0.96))] p-6 lg:p-7">
        <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-ink/42">
                  <Sparkles className="h-4 w-4 text-coral" />
                  AI overview
                </p>
                <h2 className="mt-3 max-w-3xl font-display text-4xl leading-tight text-ink">
                  A source brief for “{query}”
                </h2>
              </div>
              <div className="rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                Student-first reading map
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-base leading-8 text-ink/76">{overview.lead}</p>
              <p className="max-w-3xl text-sm leading-7 text-ink/58">{overview.confidenceLine}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {overview.actionPlan.map((step, index) => (
                <div
                  key={step}
                  className="rounded-[1.6rem] border border-ink/10 bg-white p-5 shadow-card"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/42">
                    Step 0{index + 1}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-ink/72">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {overview.coverageStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.6rem] border border-ink/10 bg-white p-5 shadow-card"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">
                  {stat.label}
                </p>
                <p className="mt-3 font-display text-3xl text-ink">{stat.value}</p>
                <p className="mt-2 text-sm leading-6 text-ink/60">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-5">
          {overview.highlights.map((highlight) => {
            const Icon = HIGHLIGHT_ICONS[highlight.label];

            return (
              <div
                key={highlight.id}
                className="flex h-full flex-col rounded-[1.85rem] border border-ink/10 bg-white p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <Badge className="bg-coral/10 text-coral">{highlight.label}</Badge>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-paper text-ink">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <h3 className="font-display text-2xl leading-tight text-ink">
                    {highlight.article.title}
                  </h3>
                  <p className="text-sm text-ink/55">
                    {formatAuthors(highlight.article.authors)}
                    {highlight.article.year ? ` • ${highlight.article.year}` : ""}
                  </p>
                </div>

                <p className="mt-4 text-sm leading-7 text-ink/70">{highlight.reason}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge>{highlight.quality.studyType}</Badge>
                  <Badge>{highlight.quality.recency}</Badge>
                  <Badge>{highlight.quality.openAccess}</Badge>
                </div>

                <div className="mt-4 rounded-[1.35rem] bg-paper p-4 text-sm text-ink/70">
                  <p className="font-medium text-ink">
                    Quality score: {highlight.quality.strengthScore}/100
                  </p>
                  <p className="mt-2 leading-7">
                    Best role: {highlight.quality.suggestedRole}. {highlight.quality.citations}.
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <Link
                    href={{
                      pathname: `/articles/${highlight.article.id}`,
                      query: { payload: JSON.stringify(highlight.article) }
                    }}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition hover:text-coral"
                  >
                    Open source brief
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={highlight.article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-ink/55 transition hover:text-ink"
                  >
                    Read paper
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
