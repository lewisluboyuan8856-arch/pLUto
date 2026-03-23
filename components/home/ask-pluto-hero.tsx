"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BrainCircuit,
  Compass,
  LibraryBig,
  SearchCheck,
  Sparkles,
  Wand2
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEFAULT_FILTERS } from "@/lib/constants";

const EXAMPLE_QUESTIONS = [
  "Which studies best support the argument that social media harms adolescent sleep quality?",
  "How effective are urban greening strategies at reducing heat islands in dense cities?",
  "What does recent research say about microplastics moving through marine food chains?",
  "How should I compare the benefits and risks of CRISPR crops for food security?"
];

const REFINEMENT_PROMPTS = [
  "Focus on review or meta-analysis papers",
  "Surface the strongest evidence for a school essay",
  "Include a source that complicates the argument",
  "Prioritise recent, beginner-friendly sources"
];

const RESEARCH_MOVES = [
  {
    icon: BrainCircuit,
    title: "Refines your question",
    copy: "Turns student language into tighter academic search angles without losing intent."
  },
  {
    icon: SearchCheck,
    title: "Finds the best-fit papers",
    copy: "Searches live academic sources and ranks the shortlist for relevance and trust."
  },
  {
    icon: LibraryBig,
    title: "Builds your evidence set",
    copy: "Highlights which source to open first, compare, cite, or save for later."
  }
];

export function AskPlutoHero() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [topic, setTopic] = useState(EXAMPLE_QUESTIONS[0]);

  function submitSearch(nextTopic?: string) {
    const resolvedTopic = (nextTopic || topic).trim();
    if (!resolvedTopic) return;

    const params = new URLSearchParams({
      topic: resolvedTopic,
      level: DEFAULT_FILTERS.level,
      sort: DEFAULT_FILTERS.sort
    });

    startTransition(() => {
      router.push(`/results?${params.toString()}`);
    });
  }

  function applyRefinement(prompt: string) {
    setTopic((current) => {
      const trimmed = current.trim();
      if (!trimmed) return prompt;
      return `${trimmed} ${prompt.toLowerCase()}.`;
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
      <div className="space-y-7">
        <div className="space-y-5">
          <Badge className="border-white/15 bg-white/10 text-white">
            AI-first research copilot
          </Badge>
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/62">
              AI Research Assistant for Students
            </p>
            <h1 className="max-w-4xl font-display text-5xl leading-[1.02] text-white md:text-6xl">
              Ask pLUto like a student. Research like you have a copilot.
            </h1>
            <p className="max-w-3xl text-xl leading-8 text-white/84">
              Compare, analyse, and understand research papers instantly
            </p>
            <p className="max-w-3xl text-lg leading-8 text-white/74">
              Start with the real question in your head. pLUto rewrites it, searches live academic
              sources, identifies stronger papers, and helps you compare evidence without feeling
              like you are lost in a generic search engine.
            </p>
          </div>
        </div>

        <div className="surface-border rounded-[2rem] bg-white/10 p-[1px]">
          <div className="rounded-[2rem] bg-[#f7f5f0] p-5 shadow-glow">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/40">
                  Ask pLUto
                </p>
                <p className="mt-2 text-sm text-ink/60">
                  Begin with a narrow question, claim, or comparison you actually need help with.
                </p>
              </div>
              <div className="rounded-full bg-coral/10 px-3 py-2 text-xs font-semibold text-coral">
                Live search with resilient fallback
              </div>
            </div>

            <div className="mt-5 rounded-[1.75rem] border border-ink/10 bg-white p-4">
              <textarea
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                rows={4}
                placeholder="Ask a research question, build an argument, or compare sources."
                className="w-full resize-none bg-transparent text-base leading-8 text-ink outline-none placeholder:text-ink/35"
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink/8 pt-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-mist text-ink">AI query rewrite</Badge>
                  <Badge className="bg-mist text-ink">Source ranking</Badge>
                  <Badge className="bg-mist text-ink">Student-friendly summaries</Badge>
                </div>
                <Button
                  onClick={() => submitSearch()}
                  disabled={isPending || !topic.trim()}
                  className="gap-2"
                  type="button"
                >
                  {isPending ? "Researching..." : "Start research"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-ink/42">
                  <Sparkles className="h-4 w-4 text-coral" />
                  Example research questions
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {EXAMPLE_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => setTopic(question)}
                      className="rounded-full border border-ink/10 bg-paper px-4 py-2 text-left text-sm font-medium text-ink/75 transition hover:border-coral/25 hover:bg-coral/5 hover:text-ink"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-ink/42">
                  <Wand2 className="h-4 w-4 text-sage" />
                  Suggested refinements
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {REFINEMENT_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => applyRefinement(prompt)}
                      className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-medium text-ink/72 transition hover:border-sage/30 hover:bg-sage/10"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="surface-border rounded-[2rem] bg-white/8 p-[1px]">
          <div className="rounded-[2rem] bg-white/10 p-6 backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/52">
                  Research cockpit
                </p>
                <h2 className="mt-3 font-display text-3xl text-white">
                  What pLUto does next
                </h2>
              </div>
              <Compass className="h-6 w-6 text-coral" />
            </div>

            <div className="mt-6 space-y-4">
              {RESEARCH_MOVES.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] border border-white/12 bg-white/8 p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                          Step 0{index + 1}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-white">{item.title}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/72">{item.copy}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.75rem] border border-white/12 bg-white/10 p-5 text-white backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/48">
              Better than endless tabs
            </p>
            <p className="mt-4 text-2xl font-semibold">Best source for essay</p>
            <p className="mt-2 text-sm leading-7 text-white/70">
              Results are shaped around what a student actually needs to cite, compare, and
              explain.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-white/12 bg-white/10 p-5 text-white backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/48">
              Grounded AI help
            </p>
            <p className="mt-4 text-2xl font-semibold">Compare sources with context</p>
            <p className="mt-2 text-sm leading-7 text-white/70">
              Ask what papers agree on, which one is stronger, and how to turn them into evidence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
