import type { MetadataRoute } from "next";

const SITE_URL = "https://researchwithai.info";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes = ["/", "/results", "/assistant", "/saved", "/auth"];

  return routes.map((route) => ({
    url: `${SITE_URL}${route === "/" ? "" : route}`,
    lastModified,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.8
  }));
}
