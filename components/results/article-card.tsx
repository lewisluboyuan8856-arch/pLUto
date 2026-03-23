import Link from "next/link";
import {
  ArrowUpRight,
  BrainCircuit,
  Clock3,
  FileText,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CitationCopyButtons } from "@/components/results/citation-copy-buttons";
import { SelectPaperButton } from "@/components/research-assistant/select-paper-button";
import { SavePaperButton } from "@/components/results/save-paper-button";
import {
  buildSourceQualitySnapshot,
  describeSourceStrength
} from "@/lib/research-assistant/source-quality";
import type { ResearchArticle } from "@/lib/types";
import { formatAuthors } from "@/lib/utils";

export function ArticleCard({
  article,
  spotlightLabels = []
}: {
  article: ResearchArticle;
  spotlightLabels?: string[];
}) {
  const quality = buildSourceQualitySnapshot(article);

  return (
    <article className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {spotlightLabels.map((label) => (
              <Badge key={label} className="border-coral/20 bg-coral/10 text-coral">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                {label}
              </Badge>
            ))}
            {article.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
            <Badge className="bg-mist text-ink">Source: {article.source}</Badge>
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-2xl text-ink">{article.title}</h3>
            <p className="text-sm text-ink/60">
              {formatAuthors(article.authors)} {article.year ? `- ${article.year}` : ""}{" "}
              {article.journal ? `- ${article.journal}` : ""}
            </p>
          </div>
          <p className="max-w-3xl text-sm leading-7 text-ink/70">{article.abstract}</p>
        </div>
        <div className="grid min-w-[260px] gap-3 rounded-[1.5rem] bg-paper p-4 text-sm text-ink/70">
          <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
            <span className="inline-flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-coral" />
              Relevance
            </span>
            <span className="font-semibold text-ink">{article.relevanceScore}/100</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-sage" />
              Source quality
            </span>
            <span className="font-semibold text-ink">{quality.strengthScore}/100</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
            <span className="inline-flex items-center gap-2">
              <FileText className="h-4 w-4 text-sage" />
              Student fit
            </span>
            <span className="font-semibold text-ink">{article.difficulty}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-gold" />
              Recency
            </span>
            <span className="font-semibold text-ink">{article.recencyScore}/100</span>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/38">
              Trust read
            </p>
            <p className="mt-2 text-sm leading-6 text-ink/72">
              {describeSourceStrength(quality.strengthScore)} based on review status, recency,
              citations, open access, and student readability.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 rounded-[1.75rem] bg-paper p-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/45">
              Why it matters
            </p>
            <p className="mt-2 text-sm leading-7 text-ink/75">{article.whyRelevant}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/45">
              Plain-English summary
            </p>
            <p className="mt-2 text-sm leading-7 text-ink/75">{article.plainEnglishSummary}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[1.35rem] border border-white/70 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">
                Credibility indicators
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge>{quality.studyType}</Badge>
                <Badge>{quality.recency}</Badge>
                <Badge>{quality.openAccess}</Badge>
              </div>
              <p className="mt-3 text-sm leading-7 text-ink/70">{quality.citations}</p>
            </div>
            <div className="rounded-[1.35rem] border border-white/70 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">
                Best use in student work
              </p>
              <p className="mt-3 text-sm leading-7 text-ink/72">
                Role: {quality.suggestedRole}. {quality.studentUsefulness}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-4 rounded-[1.5rem] border border-white/70 bg-white p-5">
          <div className="flex flex-wrap gap-2">
            <SelectPaperButton article={article} />
            <SavePaperButton article={article} />
            <CitationCopyButtons article={article} />
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={{
                pathname: `/articles/${article.id}`,
                query: { payload: JSON.stringify(article) }
              }}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink/90"
            >
              Open breakdown
            </Link>
            <Link
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/75 transition hover:border-ink/20 hover:bg-paper"
            >
              Read source
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-2 text-sm text-ink/65">
            <p className="font-medium text-ink">Concept tags</p>
            <div className="flex flex-wrap gap-2">
              {article.concepts.slice(0, 5).map((concept) => (
                <Badge key={concept}>{concept}</Badge>
              ))}
            </div>
          </div>
          <div className="rounded-[1.35rem] bg-paper p-4 text-sm text-ink/68">
            <p className="font-medium text-ink">Why students trust this pick</p>
            <p className="mt-2 leading-7">{quality.confidenceNote}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
