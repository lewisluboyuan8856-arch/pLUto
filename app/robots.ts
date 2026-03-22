import type { MetadataRoute } from "next";

import { buildAbsoluteUrl, shouldAllowIndexing } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!shouldAllowIndexing()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/"
      }
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/search"],
        disallow: ["/api/", "/auth", "/auth/callback", "/results", "/saved", "/articles/"]
      }
    ],
    sitemap: buildAbsoluteUrl("/sitemap.xml")
  };
}
