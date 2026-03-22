import { NextResponse } from "next/server";
import { z } from "zod";

import { runScholarSearch } from "@/lib/search/pipeline";

const requestSchema = z.object({
  topic: z.string().min(1),
  level: z.enum(["Secondary", "JC-IB", "Undergraduate"]).optional(),
  sort: z.enum(["relevant", "recent"]).optional(),
  openAccessOnly: z.boolean().optional(),
  reviewOnly: z.boolean().optional()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid search payload.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { topic, ...filters } = parsed.data;
  const results = await runScholarSearch(topic, filters);
  return NextResponse.json(results);
}
