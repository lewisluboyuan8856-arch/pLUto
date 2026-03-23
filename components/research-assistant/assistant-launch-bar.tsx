"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, LayoutPanelTop, MessagesSquare, Sparkles } from "lucide-react";

import {
  ASSISTANT_SELECTION_UPDATED_EVENT,
  readAssistantArticles,
  readAssistantSelection
} from "@/lib/research-assistant/client-storage";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function AssistantLaunchBar({
  variant = "default"
}: {
  variant?: "default" | "dashboard";
}) {
  const [count, setCount] = useState(0);
  const [titles, setTitles] = useState<string[]>([]);

  useEffect(() => {
    function syncCount() {
      setCount(readAssistantSelection().length);
      setTitles(readAssistantArticles().map((article) => article.title));
    }

    syncCount();
    window.addEventListener(ASSISTANT_SELECTION_UPDATED_EVENT, syncCount);
    window.addEventListener("storage", syncCount);

    return () => {
      window.removeEventListener(ASSISTANT_SELECTION_UPDATED_EVENT, syncCount);
      window.removeEventListener("storage", syncCount);
    };
  }, []);

  if (variant === "dashboard") {
    return (
      <div className="rounded-[1.95rem] border border-ink/10 bg-white p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-ink/45">
              <Sparkles className="h-4 w-4 text-coral" />
              Research copilot
            </p>
            <h2 className="mt-3 font-display text-3xl text-ink">
              Compare & Chat is part of the workflow now.
            </h2>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-paper text-ink">
            <LayoutPanelTop className="h-5 w-5" />
          </div>
        </div>

        <p className="mt-4 text-sm leading-7 text-ink/68">
          {count
            ? `${count} paper${count === 1 ? "" : "s"} selected. Open the assistant to compare methods, identify contradictions, or turn these papers into an evidence paragraph.`
            : "Select 2 to 5 papers as you read. The assistant will stay grounded in exactly those papers only."}
        </p>

        {titles.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {titles.slice(0, 3).map((title) => (
              <Badge key={title} className="bg-mist text-ink">
                {title}
              </Badge>
            ))}
            {titles.length > 3 ? <Badge>+{titles.length - 3} more</Badge> : null}
          </div>
        ) : null}

        <div className="mt-5 space-y-3 rounded-[1.5rem] bg-paper p-4">
          {[
            "Compare conclusions side by side",
            "Find the strongest paper for your essay claim",
            "Generate a grounded evidence paragraph"
          ].map((item) => (
            <p key={item} className="text-sm text-ink/70">
              {item}
            </p>
          ))}
        </div>

        <Link
          href="/assistant"
          className={cn(
            "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition",
            count ? "bg-ink text-white hover:bg-ink/90" : "bg-coral text-white hover:bg-coral/90"
          )}
        >
          <MessagesSquare className="h-4 w-4" />
          {count ? "Open Compare & Chat" : "Open Research Assistant"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-[1.75rem] border border-ink/10 bg-white p-5 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-ink/45">
            <Sparkles className="h-4 w-4 text-coral" />
            Research Assistant
          </p>
          <p className="text-sm leading-7 text-ink/68">
            {count
              ? `${count} paper${count === 1 ? "" : "s"} selected. Open Compare & Chat to ask grounded questions, compare methods, or plan how to use the sources in an essay.`
              : "Select 2 to 5 papers from results or your shortlist, then open Compare & Chat to work across those sources."}
          </p>
          {titles.length ? (
            <div className="flex flex-wrap gap-2">
              {titles.slice(0, 2).map((title) => (
                <Badge key={title} className="bg-mist text-ink">
                  {title}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
        <Link
          href="/assistant"
          className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
            count
              ? "bg-ink text-white hover:bg-ink/90"
              : "border border-ink/10 bg-paper text-ink/70 hover:border-ink/20"
          }`}
        >
          <MessagesSquare className="h-4 w-4" />
          {count ? "Open Compare & Chat" : "Open Research Assistant"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
