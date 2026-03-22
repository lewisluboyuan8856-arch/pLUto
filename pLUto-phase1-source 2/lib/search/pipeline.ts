import type { SearchFilters, SearchResponse } from "@/lib/types";
import { buildMockSearchResponse } from "@/lib/search/mock-data";

export async function runScholarSearch(
  query: string,
  partialFilters?: Partial<SearchFilters>
): Promise<SearchResponse> {
  return buildMockSearchResponse(query, partialFilters);
}
