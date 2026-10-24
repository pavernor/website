import { getAllPosts } from "@/lib/blog";

function esc(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function GET() {
  const posts = getAllPosts();
  const items = posts
    .map(
      (p) => `
    <item>
      <title>${esc(p.title)}</title>
      <link>https://pavernor.tech/blog/${p.slug}</link>
      <guid>https://pavernor.tech/blog/${p.slug}</guid>
      <pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate>
      <category>${esc(p.category)}</category>
      <description>${esc(p.excerpt)}</description>
    </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Pavernor — Blog</title>
    <link>https://pavernor.tech/blog</link>
    <description>Notes, news &amp; ideas from Pavernor.</description>
    <language>en</language>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}