"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";

import { LEVEL_OPTIONS } from "@/lib/constants";
import type { SearchFilters } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SearchFormProps = {
  initialTopic?: string;
  initialFilters?: SearchFilters;
  compact?: boolean;
};

export function SearchForm({
  initialTopic = "",
  initialFilters,
  compact = false
}: SearchFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [topic, setTopic] = useState(initialTopic);
  const [showFilters, setShowFilters] = useState(!compact);
  const [level, setLevel] = useState<SearchFilters["level"]>(
    initialFilters?.level || "JC-IB"
  );
  const [sort, setSort] = useState<SearchFilters["sort"]>(
    initialFilters?.sort || "relevant"
  );
  const [openAccessOnly, setOpenAccessOnly] = useState(
    initialFilters?.openAccessOnly || false
  );
  const [reviewOnly, setReviewOnly] = useState(initialFilters?.reviewOnly || false);

  function handleSubmit() {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) return;

    const params = new URLSearchParams({
      topic: trimmedTopic,
      level,
      sort
    });

    if (openAccessOnly) params.set("openAccess", "true");
    if (reviewOnly) params.set("reviewOnly", "true");

    startTransition(() => {
      router.push(`/results?${params.toString()}`);
    });
  }

  return (
    <div
      className={cn(
        "rounded-[2rem] border border-white/10 bg-white/95 p-5 text-ink shadow-glow backdrop-blur-xl",
        compact ? "space-y-4" : "space-y-6"
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row">
        <label className="flex flex-1 items-center gap-3 rounded-2xl border border-ink/10 bg-paper px-4 py-4">
          <Search className="h-5 w-5 text-ink/40" />
          <input
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="Try a narrow question, e.g. How does microplastic exposure affect marine food chains?"
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35"
          />
        </label>
        <Button
          onClick={handleSubmit}
          className="h-auto min-w-[150px]"
          disabled={isPending || !topic.trim()}
          type="button"
        >
          {isPending ? "Searching..." : "Search smarter"}
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">Shape the results</p>
          <p className="text-sm text-ink/60">Tune for age level, recency, and source quality.</p>
        </div>
        {compact ? (
          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/70"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        ) : null}
      </div>
      {showFilters ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink/70">Level</span>
            <select
              value={level}
              onChange={(event) => setLevel(event.target.value as SearchFilters["level"])}
              className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none"
            >
              {LEVEL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink/70">Sort</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SearchFilters["sort"])}
              className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="relevant">Most relevant</option>
              <option value="recent">Most recent</option>
            </select>
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm font-medium text-ink/70">
            <input
              type="checkbox"
              checked={openAccessOnly}
              onChange={(event) => setOpenAccessOnly(event.target.checked)}
              className="h-4 w-4 rounded border-ink/20"
            />
            Open access only
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm font-medium text-ink/70">
            <input
              type="checkbox"
              checked={reviewOnly}
              onChange={(event) => setReviewOnly(event.target.checked)}
              className="h-4 w-4 rounded border-ink/20"
            />
            Review articles only
          </label>
        </div>
      ) : null}
    </div>
  );
}
