import Link from "next/link";

import { cn } from "@/lib/utils";

type TopicPill = {
  id: string;
  label: string;
  prompt: string;
};

export function TopicPills({
  topics,
  className,
  dark = false
}: {
  topics: TopicPill[];
  className?: string;
  dark?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {topics.map((topic) => (
        <Link
          key={topic.id}
          href={`/results?topic=${encodeURIComponent(topic.prompt)}`}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition",
            dark
              ? "border-white/12 bg-white/8 text-white/82 hover:bg-white/12"
              : "border-ink/10 bg-white text-ink/72 hover:border-ink/20 hover:bg-paper"
          )}
        >
          {topic.label}
        </Link>
      ))}
    </div>
  );
}
