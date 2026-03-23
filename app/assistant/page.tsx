import type { Metadata } from "next";

import { AssistantShell } from "@/components/research-assistant/assistant-shell";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Research Assistant",
  robots: {
    index: false,
    follow: false
  }
};

export default function AssistantPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      <div className="max-w-3xl">
        <Badge>Research Assistant</Badge>
        <p className="mt-4 text-lg leading-8 text-ink/65">
          Your grounded study companion inside pLUto. It stays limited to the papers you selected
          and helps you compare, summarise, and turn evidence into student-ready writing support.
        </p>
      </div>

      <AssistantShell />
    </div>
  );
}
