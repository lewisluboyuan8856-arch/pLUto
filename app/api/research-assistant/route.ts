import { NextResponse } from "next/server";
import { z } from "zod";

import { runResearchAssistant } from "@/lib/research-assistant/service";

const articleSchema = z.object({
  id: z.string().min(1),
  externalIds: z
    .object({
      doi: z.string().optional(),
      semanticScholarId: z.string().optional(),
      openAlexId: z.string().optional()
    })
    .default({}),
  title: z.string().min(1),
  authors: z.array(z.string()),
  year: z.number().optional(),
  journal: z.string().optional(),
  abstract: z.string(),
  url: z.string().min(1),
  pdfUrl: z.string().optional(),
  isOpenAccess: z.boolean(),
  isReviewArticle: z.boolean(),
  citationCount: z.number().optional(),
  source: z.enum(["Semantic Scholar", "OpenAlex", "Mock"]),
  concepts: z.array(z.string()),
  relevanceScore: z.number(),
  studentFitScore: z.number(),
  recencyScore: z.number(),
  whyRelevant: z.string(),
  plainEnglishSummary: z.string(),
  difficulty: z.enum(["Accessible", "Intermediate", "Advanced"]),
  tags: z.array(z.string()),
  limitations: z.array(z.string()).optional(),
  keyFindings: z.array(z.string()).optional(),
  suggestedUses: z.array(z.string()).optional(),
  followUpTerms: z.array(z.string()).optional()
});

const requestSchema = z
  .object({
    mode: z.enum(["compare", "chat", "essay"]),
    prompt: z.string().trim().max(600).optional(),
    articles: z.array(articleSchema).min(1).max(5)
  })
  .superRefine((value, context) => {
    if (value.mode === "compare" && value.articles.length < 2) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choose at least 2 papers to compare.",
        path: ["articles"]
      });
    }
  });

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid research assistant payload.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { mode, articles } = parsed.data;
  const prompt =
    parsed.data.prompt?.trim() ||
    (mode === "compare"
      ? "Compare these selected papers for a student."
      : mode === "essay"
        ? "How could I use this source in an essay or project?"
        : "What do these selected papers suggest?");

  const response = await runResearchAssistant(mode, prompt, articles);
  return NextResponse.json(response);
}
