import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().map((p) => ({
    url: `https://pavernor.tech/blog/${p.slug}`,
    lastModified: new Date(`${p.date}T00:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const latest = posts[0]?.lastModified ?? new Date("2026-10-09T00:00:00Z");

  return [
    {
      url: "https://pavernor.tech",
      lastModified: latest,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://pavernor.tech/blog",
      lastModified: latest,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...posts,
  ];
}