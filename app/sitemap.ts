import { MetadataRoute } from "next";

const BASE = "https://www.craftfolio.co";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE,                              lastModified: now, priority: 1.0, changeFrequency: "weekly" },
    { url: `${BASE}/resume-help`,             lastModified: now, priority: 0.9, changeFrequency: "monthly" },
    { url: `${BASE}/resume-help/analyze`,     lastModified: now, priority: 0.9, changeFrequency: "monthly" },
    { url: `${BASE}/support`,                 lastModified: now, priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/privacy`,                 lastModified: now, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE}/terms`,                   lastModified: now, priority: 0.3, changeFrequency: "yearly" },
  ];
}
