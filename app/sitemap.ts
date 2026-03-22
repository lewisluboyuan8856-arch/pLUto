import type { MetadataRoute } from "next";

import { buildAbsoluteUrl, shouldAllowIndexing } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!shouldAllowIndexing()) {
    return [];
  }

  const lastModified = new Date();

  return [
    {
      url: buildAbsoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: buildAbsoluteUrl("/search"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8
    }
  ];
}
