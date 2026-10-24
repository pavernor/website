import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, formatDate } from "@/lib/blog";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      ...(post.cover ? { images: [{ url: post.cover }] } : {}),
    },
  };
}

export default async function PostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <main className="flex-1">
      <article className="px-5 pb-28 pt-32 sm:px-7 lg:pt-40">
        <div className="mx-auto max-w-[720px]">
          <Link href="/blog" className="link-u label text-muted transition-colors hover:text-fg">
            ← All notes
          </Link>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="label text-muted">{formatDate(post.date)}</span>
            <span className="label text-accent">{post.category}</span>
          </div>
          <h1 className="mt-5 text-balance text-[clamp(2.25rem,4.4vw,3.5rem)] leading-[1.02] tracking-[-0.045em]">
            {post.title}
          </h1>
          <p className="mt-6 max-w-[560px] border-l border-fg pl-4 text-[17px] leading-[1.5]">
            {post.excerpt}
          </p>
          <p className="label mt-6 text-muted">By {post.author}</p>
        </div>

        {post.cover && (
          <div className="mx-auto mt-12 aspect-[16/9] max-w-[1100px] overflow-hidden rounded-[4px] bg-surface">
            <img src={post.cover} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        <div
          className="post-body mx-auto mt-12 max-w-[720px]"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        <div className="mx-auto mt-16 max-w-[720px] border-t border-line pt-8">
          <Link href="/blog" className="link-u label text-muted transition-colors hover:text-fg">
            ← Back to all notes
          </Link>
        </div>
      </article>
    </main>
  );
}
