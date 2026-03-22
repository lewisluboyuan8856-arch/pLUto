import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrainCircuit, Clock3, FileText } from "lucide-react";

import { CitationCopyButtons } from "@/components/results/citation-copy-buttons";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { getMockArticleById } from "@/lib/search/mock-data";
import type { ResearchArticle } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";

type ArticlePageProps = {
  params: {
    id: string;
  };
  searchParams: {
    payload?: string;
  };
};

export const metadata: Metadata = {
  title: "Article detail",
  robots: {
    index: false,
    follow: false
  }
};

export default function ArticlePage({ params, searchParams }: ArticlePageProps) {
  const articleFromPayload = searchParams.payload
    ? safeJsonParse<ResearchArticle | null>(searchParams.payload, null)
    : null;
  const article =
    articleFromPayload && articleFromPayload.id === params.id
      ? articleFromPayload
      : getMockArticleById(params.id);

  if (!article) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-14 lg:px-8">
      <div className="rounded-[2.25rem] border border-ink/10 bg-white p-8 shadow-card">
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
          <Badge className="bg-mist text-ink">Article breakdown</Badge>
        </div>
        <h1 className="mt-5 font-display text-5xl text-ink">{article.title}</h1>
        <p className="mt-4 text-lg leading-8 text-ink/65">{article.plainEnglishSummary}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] bg-paper p-5">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-ink/70">
              <BrainCircuit className="h-4 w-4 text-coral" />
              Relevance score
            </p>
            <p className="mt-3 font-display text-4xl text-ink">{article.relevanceScore}/100</p>
          </div>
          <div className="rounded-[1.5rem] bg-paper p-5">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-ink/70">
              <FileText className="h-4 w-4 text-sage" />
              Difficulty
            </p>
            <p className="mt-3 font-display text-4xl text-ink">{article.difficulty}</p>
          </div>
          <div className="rounded-[1.5rem] bg-paper p-5">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-ink/70">
              <Clock3 className="h-4 w-4 text-gold" />
              Published
            </p>
            <p className="mt-3 font-display text-4xl text-ink">{article.year || "n.d."}</p>
          </div>
        </div>

        <div className="mt-8 rounded-[1.75rem] bg-paper p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/40">
            Why this paper made the shortlist
          </p>
          <p className="mt-3 text-sm leading-7 text-ink/75">{article.whyRelevant}</p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[1.75rem] bg-paper p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/40">
              Key findings
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-ink/75">
              {(article.keyFindings || []).map((finding) => (
                <li key={finding}>- {finding}</li>
              ))}
            </ul>
          </section>
          <section className="rounded-[1.75rem] bg-paper p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/40">
              Limitations
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-ink/75">
              {(article.limitations || []).map((limitation) => (
                <li key={limitation}>- {limitation}</li>
              ))}
            </ul>
          </section>
          <section className="rounded-[1.75rem] bg-paper p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/40">
              How a student could use this source
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-ink/75">
              {(article.suggestedUses || []).map((useCase) => (
                <li key={useCase}>- {useCase}</li>
              ))}
            </ul>
          </section>
          <section className="rounded-[1.75rem] bg-paper p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/40">
              Suggested follow-up terms
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(article.followUpTerms || []).map((term) => (
                <Badge key={term}>{term}</Badge>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-8 rounded-[1.75rem] bg-paper p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/40">
            Quick citation copy
          </p>
          <div className="mt-4">
            <CitationCopyButtons article={article} />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={article.url} target="_blank" rel="noreferrer">
            Open original article
          </ButtonLink>
          <Link
            href="/saved"
            className="inline-flex items-center rounded-full border border-ink/10 px-5 py-3 text-sm font-semibold text-ink/70 transition hover:border-ink/20 hover:bg-paper"
          >
            Open shortlist
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center rounded-full border border-ink/10 px-5 py-3 text-sm font-semibold text-ink/70 transition hover:border-ink/20 hover:bg-paper"
          >
            Start another search
          </Link>
        </div>
      </div>
    </div>
  );
}
