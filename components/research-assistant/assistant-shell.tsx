"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowRight,
  Bot,
  CheckSquare,
  Compass,
  FilePenLine,
  GitCompareArrows,
  GraduationCap,
  LayoutPanelTop,
  MessagesSquare,
  NotebookPen,
  Scale,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  X
} from "lucide-react";

import {
  ASSISTANT_SELECTION_UPDATED_EVENT,
  clearAssistantSelection,
  readAssistantArticles,
  removeAssistantArticle
} from "@/lib/research-assistant/client-storage";
import {
  buildSourceQualitySnapshot,
  describeSourceStrength
} from "@/lib/research-assistant/source-quality";
import { Badge } from "@/components/ui/badge";
import type {
  ResearchArticle,
  ResearchAssistantMode,
  ResearchAssistantResponse
} from "@/lib/types";

type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: ResearchAssistantMode;
  response?: ResearchAssistantResponse;
};

const STARTER_PROMPTS: Array<{
  label: string;
  prompt: string;
  mode: ResearchAssistantMode;
}> = [
  {
    label: "Compare these papers",
    prompt:
      "Compare these selected papers by methodology, findings, limitations, and student usefulness.",
    mode: "compare"
  },
  {
    label: "Which one is strongest for a school essay?",
    prompt: "Which selected paper is strongest for a school essay, and why?",
    mode: "chat"
  },
  {
    label: "What are the main contradictions?",
    prompt: "What are the main contradictions or tensions across these selected papers?",
    mode: "compare"
  },
  {
    label: "Summarise the evidence in simple terms",
    prompt: "Summarise the evidence from these selected papers in simple student-friendly terms.",
    mode: "chat"
  },
  {
    label: "Write a short comparison paragraph",
    prompt:
      "Write a short comparison paragraph using only these selected papers in student-friendly language.",
    mode: "essay"
  },
  {
    label: "Generate research notes",
    prompt:
      "Create a concise research notes summary from these selected papers for a student researcher.",
    mode: "essay"
  }
];

function messageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function ResponseCard({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-ink/10 bg-white p-4 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">{label}</p>
      <p className="mt-2 text-sm leading-7 text-ink/75">{value}</p>
    </div>
  );
}

function StudyOutputCard({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.45rem] border border-ink/10 bg-white p-4 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">{label}</p>
      <p className="mt-3 text-sm leading-7 text-ink/74">{value}</p>
    </div>
  );
}

export function AssistantShell() {
  const [articles, setArticles] = useState<ResearchArticle[]>([]);
  const [includedArticleIds, setIncludedArticleIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function syncArticles() {
      const nextArticles = readAssistantArticles();
      setArticles(nextArticles);
      setIncludedArticleIds((currentIds) => {
        const validIds = currentIds.filter((id) =>
          nextArticles.some((article) => article.id === id)
        );

        if (validIds.length) {
          return validIds;
        }

        return nextArticles.map((article) => article.id);
      });
    }

    syncArticles();
    window.addEventListener(ASSISTANT_SELECTION_UPDATED_EVENT, syncArticles);
    window.addEventListener("storage", syncArticles);

    return () => {
      window.removeEventListener(ASSISTANT_SELECTION_UPDATED_EVENT, syncArticles);
      window.removeEventListener("storage", syncArticles);
    };
  }, []);

  const includedArticles = articles.filter((article) => includedArticleIds.includes(article.id));

  async function sendPrompt(
    mode: ResearchAssistantMode,
    content: string,
    selectedArticles: ResearchArticle[]
  ) {
    if (!selectedArticles.length) {
      setError("Select at least one paper first so pLUto can stay grounded in visible sources.");
      return;
    }

    if (mode === "compare" && selectedArticles.length < 2) {
      setError("Choose at least 2 papers to run a grounded comparison.");
      return;
    }

    const userMessage: AssistantMessage = {
      id: messageId(),
      role: "user",
      content,
      mode
    };

    setError("");
    setIsLoading(true);
    setMessages((current) => [...current, userMessage]);

    try {
      const response = await fetch("/api/research-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          mode,
          prompt: content,
          articles: selectedArticles
        })
      });

      if (!response.ok) {
        throw new Error("The Research Assistant could not answer that request yet.");
      }

      const data = (await response.json()) as ResearchAssistantResponse;
      setMessages((current) => [
        ...current,
        {
          id: messageId(),
          role: "assistant",
          content: data.answer,
          response: data,
          mode
        }
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The Research Assistant could not answer that request yet."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleChatSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    void sendPrompt("chat", trimmedPrompt, includedArticles);
    setPrompt("");
  }

  function toggleIncludedArticle(articleId: string) {
    setIncludedArticleIds((currentIds) =>
      currentIds.includes(articleId)
        ? currentIds.filter((id) => id !== articleId)
        : [...currentIds, articleId]
    );
  }

  function handleStarterPrompt(mode: ResearchAssistantMode, starterPrompt: string) {
    if (!includedArticles.length) {
      setPrompt(starterPrompt);
      setError("Select papers from results or your shortlist to unlock grounded answers.");
      return;
    }

    void sendPrompt(mode, starterPrompt, includedArticles);
  }

  return (
    <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="order-2 space-y-6 xl:order-1">
        <div className="surface-border rounded-[2.25rem] bg-white/85 p-[1px] shadow-glow">
          <div className="rounded-[2.2rem] bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(239,235,227,0.96))] p-6 lg:p-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-4xl">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-ink/42">
                  <Sparkles className="h-4 w-4 text-coral" />
                  Study Companion
                </p>
                <h1 className="mt-4 font-display text-4xl leading-tight text-ink lg:text-5xl">
                  Hi, I am pLUto, your study companion. How may I help you today?
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-ink/66">
                  I will only use the papers you choose inside this workspace. Ask me to compare
                  them, explain the evidence simply, suggest what belongs in an essay, or turn the
                  selected sources into notes and grounded writing.
                </p>
              </div>
              <div className="rounded-[1.45rem] bg-white px-4 py-3 text-sm text-ink/66 shadow-card">
                {includedArticles.length} grounded source
                {includedArticles.length === 1 ? "" : "s"} active
              </div>
            </div>

            <div className="mt-6 rounded-[1.75rem] bg-ink p-5 text-white shadow-glow">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Grounded only in selected papers</p>
                  <p className="mt-2 text-sm leading-7 text-white/76">
                    I do not answer from the open web or general memory here. I stay within the
                    visible papers and metadata, and if OpenAI is unavailable I fall back to
                    metadata-based synthesis without breaking your workflow.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/42">
                Try asking
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {STARTER_PROMPTS.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => handleStarterPrompt(action.mode, action.prompt)}
                    className="rounded-[1.45rem] border border-ink/10 bg-white p-4 text-left shadow-card transition hover:border-coral/25 hover:bg-coral/5"
                  >
                    <p className="text-sm font-semibold text-ink">{action.label}</p>
                    <p className="mt-2 text-sm leading-6 text-ink/62">{action.prompt}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {includedArticles.length ? (
                includedArticles.map((article) => (
                  <Badge key={article.id} className="bg-mist text-ink">
                    {article.title}
                  </Badge>
                ))
              ) : (
                <Badge>Choose papers from results or shortlist to start grounded chat</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[2.15rem] border border-ink/10 bg-white/90 shadow-card">
          <div className="border-b border-ink/10 px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-ink/42">
                  <MessagesSquare className="h-4 w-4 text-sage" />
                  Conversation
                </p>
                <p className="mt-2 text-sm text-ink/62">
                  A student-facing chat interface grounded only in the selected papers.
                </p>
              </div>
              <div className="rounded-full bg-paper px-4 py-2 text-sm text-ink/60">
                {includedArticles.length
                  ? `${includedArticles.length} source${includedArticles.length === 1 ? "" : "s"} available for grounding`
                  : "No sources selected yet"}
              </div>
            </div>
          </div>

          <div className="space-y-5 px-6 py-6">
            {!messages.length ? (
              <>
                <div className="mr-auto max-w-3xl rounded-[1.9rem] border border-ink/10 bg-paper p-5 shadow-card">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-ink shadow-card">
                      <Compass className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">
                        pLUto
                      </p>
                      <p className="mt-2 text-base leading-8 text-ink/78">
                        Hi, I am pLUto, your study companion. How may I help you today?
                      </p>
                      <p className="mt-2 text-sm leading-7 text-ink/64">
                        I can compare these papers, point out agreement and contradiction, suggest
                        which source is strongest for a school essay, and generate notes or a short
                        grounded comparison paragraph.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.6rem] border border-ink/10 bg-white p-5 shadow-card">
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                      <GitCompareArrows className="h-4 w-4 text-coral" />
                      Compare and evaluate
                    </p>
                    <p className="mt-3 text-sm leading-7 text-ink/68">
                      Ask for methodology differences, contradictions, strongest source reasoning,
                      or best-for-essay guidance.
                    </p>
                  </div>
                  <div className="rounded-[1.6rem] border border-ink/10 bg-white p-5 shadow-card">
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                      <NotebookPen className="h-4 w-4 text-sage" />
                      Turn papers into study outputs
                    </p>
                    <p className="mt-3 text-sm leading-7 text-ink/68">
                      I can generate a short comparison paragraph, research notes summary, and a
                      suggested essay or project usage note from the selected sources.
                    </p>
                  </div>
                </div>
              </>
            ) : null}

            {messages.map((message) => (
              <div key={message.id} className={message.role === "assistant" ? "mr-auto" : "ml-auto"}>
                <div
                  className={`max-w-[54rem] rounded-[1.9rem] p-5 shadow-card ${
                    message.role === "assistant"
                      ? "border border-ink/10 bg-paper"
                      : "bg-ink text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
                    {message.role === "assistant" ? (
                      <>
                        <Bot className="h-4 w-4 text-coral" />
                        {message.response?.usedFallback ? "Grounded fallback" : "pLUto"}
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4" />
                        You
                      </>
                    )}
                  </div>

                  <p
                    className={`mt-3 whitespace-pre-wrap text-sm leading-7 ${
                      message.role === "assistant" ? "text-ink/78" : "text-white/86"
                    }`}
                  >
                    {message.content}
                  </p>

                  {message.response?.comparison ? (
                    <div className="mt-5 space-y-4">
                      <div className="grid gap-4 xl:grid-cols-2">
                        <ResponseCard
                          label="Agreement map"
                          value={message.response.comparison.agreementMap}
                        />
                        <ResponseCard
                          label="Main contradictions"
                          value={message.response.comparison.contradictions}
                        />
                        <ResponseCard
                          label="Strongest source and why"
                          value={message.response.comparison.strongestPaper}
                        />
                        <ResponseCard
                          label="Best for essay or project"
                          value={message.response.comparison.bestForEssayProject}
                        />
                      </div>

                      <div className="grid gap-4 xl:grid-cols-2">
                        <ResponseCard
                          label="Research question"
                          value={message.response.comparison.researchQuestion}
                        />
                        <ResponseCard
                          label="Methodology"
                          value={message.response.comparison.methodology}
                        />
                        <ResponseCard
                          label="Findings"
                          value={message.response.comparison.findings}
                        />
                        <ResponseCard
                          label="Conclusions"
                          value={message.response.comparison.conclusions}
                        />
                        <ResponseCard
                          label="Limitations"
                          value={message.response.comparison.limitations}
                        />
                        <ResponseCard
                          label="Usefulness for students"
                          value={message.response.comparison.studentUsefulness}
                        />
                      </div>
                    </div>
                  ) : null}

                  {message.response?.studentOutputs ? (
                    <div className="mt-5 rounded-[1.55rem] border border-ink/10 bg-white p-4">
                      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">
                        <GraduationCap className="h-4 w-4 text-gold" />
                        Student study pack
                      </p>
                      <div className="mt-4 grid gap-4 xl:grid-cols-3">
                        <StudyOutputCard
                          label="Comparison paragraph"
                          value={message.response.studentOutputs.comparisonParagraph}
                        />
                        <StudyOutputCard
                          label="Research notes summary"
                          value={message.response.studentOutputs.researchNotes}
                        />
                        <StudyOutputCard
                          label="Essay or project usage"
                          value={message.response.studentOutputs.usageNote}
                        />
                      </div>
                    </div>
                  ) : null}

                  {message.response?.comparison ? (
                    <div className="mt-5 rounded-[1.55rem] border border-ink/10 bg-white p-4">
                      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">
                        <FilePenLine className="h-4 w-4 text-coral" />
                        Evidence-based paragraph
                      </p>
                      <p className="mt-3 text-sm leading-7 text-ink/76">
                        {message.response.comparison.evidenceParagraph}
                      </p>
                    </div>
                  ) : null}

                  {message.response?.grounding?.length ? (
                    <div className="mt-5 rounded-[1.55rem] border border-ink/10 bg-white p-4">
                      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">
                        <ShieldCheck className="h-4 w-4 text-sage" />
                        Grounded only in chosen papers
                      </p>
                      <div className="mt-3 space-y-3">
                        {message.response.grounding.map((item) => (
                          <div
                            key={`${message.id}-${item.articleId}`}
                            className="rounded-[1.1rem] bg-paper p-3 text-sm leading-7 text-ink/74"
                          >
                            <p className="font-medium text-ink">{item.title}</p>
                            <p>{item.evidenceNote}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {isLoading ? (
              <div className="mr-auto max-w-2xl rounded-[1.8rem] border border-ink/10 bg-paper p-5 shadow-card">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">
                  <Bot className="h-4 w-4 text-coral" />
                  pLUto
                </p>
                <p className="mt-3 text-sm leading-7 text-ink/70">
                  Thinking through the selected papers and staying grounded in the visible metadata.
                </p>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-[1.5rem] border border-coral/20 bg-coral/10 p-4 text-sm text-coral">
                {error}
              </div>
            ) : null}
          </div>
        </div>

        <form
          onSubmit={handleChatSubmit}
          className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card"
        >
          <label className="block">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">
              <Scale className="h-4 w-4 text-coral" />
              Ask pLUto about the selected papers
            </span>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={4}
              placeholder="Compare these papers, identify contradictions, summarise the evidence simply, or write a short grounded comparison paragraph."
              className="mt-4 w-full rounded-[1.5rem] border border-ink/10 bg-paper px-4 py-4 text-sm text-ink outline-none placeholder:text-ink/35"
            />
          </label>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="inline-flex items-start gap-2 text-xs leading-6 text-ink/50">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
              Answers stay grounded in the included papers only. If OpenAI is unavailable, pLUto
              falls back to metadata-based synthesis.
            </p>
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="inline-flex items-center gap-2 rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:bg-coral/90 disabled:opacity-60"
            >
              {isLoading ? "Thinking..." : "Send to pLUto"}
              <SendHorizontal className="h-4 w-4" />
            </button>
          </div>
        </form>
      </section>

      <aside className="order-1 space-y-6 xl:order-2 xl:sticky xl:top-24 xl:self-start">
        <div className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-ink/42">
                <LayoutPanelTop className="h-4 w-4 text-sage" />
                Selected papers
              </p>
              <h2 className="mt-3 font-display text-3xl text-ink">
                {articles.length} paper{articles.length === 1 ? "" : "s"} loaded
              </h2>
              <p className="mt-3 text-sm leading-7 text-ink/64">
                Toggle exactly which papers pLUto is allowed to use. Unchecked papers stay visible
                but are excluded from grounding.
              </p>
            </div>
            {articles.length ? (
              <button
                type="button"
                onClick={() => {
                  clearAssistantSelection();
                  setMessages([]);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/70 transition hover:border-coral/30 hover:bg-coral/5 hover:text-coral"
              >
                <Trash2 className="h-4 w-4" />
                Clear all
              </button>
            ) : null}
          </div>
        </div>

        {articles.length ? (
          <div className="space-y-4">
            {articles.map((article) => {
              const quality = buildSourceQualitySnapshot(article);
              const isIncluded = includedArticleIds.includes(article.id);

              return (
                <div
                  key={article.id}
                  className={`rounded-[1.7rem] border p-5 shadow-card transition ${
                    isIncluded ? "border-sage/35 bg-white" : "border-ink/10 bg-white/75"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <label className="flex flex-1 cursor-pointer gap-3">
                      <input
                        type="checkbox"
                        checked={isIncluded}
                        onChange={() => toggleIncludedArticle(article.id)}
                        className="mt-1 h-4 w-4 rounded border-ink/20 text-coral focus:ring-coral/40"
                      />
                      <div>
                        <p className="font-display text-xl text-ink">{article.title}</p>
                        <p className="mt-2 text-sm leading-6 text-ink/62">
                          {article.plainEnglishSummary}
                        </p>
                      </div>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeAssistantArticle(article.id)}
                      className="rounded-full border border-ink/10 p-2 text-ink/50 transition hover:border-coral/30 hover:bg-coral/5 hover:text-coral"
                      aria-label={`Remove ${article.title} from Research Assistant`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge>{quality.studyType}</Badge>
                    <Badge>{quality.recency}</Badge>
                    <Badge>{quality.openAccess}</Badge>
                    <Badge className="bg-mist text-ink">Role: {quality.suggestedRole}</Badge>
                  </div>

                  <div className="mt-4 rounded-[1.45rem] bg-paper p-4 text-sm text-ink/70">
                    <p className="inline-flex items-center gap-2 font-medium text-ink">
                      <Star className="h-4 w-4 text-gold" />
                      Quality {quality.strengthScore}/100
                    </p>
                    <p className="mt-2 leading-7">
                      {describeSourceStrength(quality.strengthScore)}. {quality.citations}.
                    </p>
                    <p className="mt-2 text-xs leading-6 text-ink/55">{quality.confidenceNote}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        void sendPrompt(
                          "essay",
                          `How should I use "${article.title}" in a school essay, presentation, report, or project?`,
                          [article]
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/75 transition hover:border-ink/20 hover:bg-paper"
                    >
                      <FilePenLine className="h-4 w-4" />
                      Use in my work
                    </button>
                    <Link
                      href={{
                        pathname: `/articles/${article.id}`,
                        query: { payload: JSON.stringify(article) }
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/75 transition hover:border-ink/20 hover:bg-paper"
                    >
                      Open breakdown
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.9rem] border border-dashed border-ink/15 bg-white p-6 text-center shadow-card">
            <p className="font-display text-3xl text-ink">No papers selected yet.</p>
            <p className="mt-3 text-sm leading-7 text-ink/64">
              Pick 2 to 5 papers from your results or shortlist, then come back here for grounded
              comparison, notes, and writing support.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/search"
                className="inline-flex items-center justify-center rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:bg-coral/90"
              >
                Start from search
              </Link>
              <Link
                href="/saved"
                className="inline-flex items-center justify-center rounded-full border border-ink/10 px-5 py-3 text-sm font-semibold text-ink/75 transition hover:border-ink/20 hover:bg-paper"
              >
                Open shortlist
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
