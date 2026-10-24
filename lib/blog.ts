import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

export type Post = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  author: string;
  cover: string | null;
  body: string;
  html: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function parseFile(fileName: string): Post {
  const raw = fs.readFileSync(path.join(BLOG_DIR, fileName), "utf8");
  const { data, content } = matter(raw);
  const slug = fileName.replace(/\.md$/, "");
  return {
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? "1970-01-01"),
    category: String(data.category ?? "Note"),
    excerpt: String(data.excerpt ?? ""),
    author: String(data.author ?? "Pavernor"),
    cover: data.cover ? String(data.cover) : null,
    body: content,
    html: marked.parse(content) as string,
  };
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(parseFile)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  const file = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  return parseFile(`${slug}.md`);
}

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}