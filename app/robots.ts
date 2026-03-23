import type { MetadataRoute } from "next";

const SITEMAP_URL = "https://researchwithai.info/sitemap.xml";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    sitemap: SITEMAP_URL
  };
}
