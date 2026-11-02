import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, formatDate } from "@/lib/blog";
import NoteCover from "@/components/NoteCover";
import { DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/seo";

const DESCRIPTION =
  "Notes, news & ideas from Pavernor — announcements, field notes, and explorations in agentic AI.";

export const metadata: Metadata = {
  title: "Notes",
  description: DESCRIPTION,
  // Wajib di-set: tanpa ini canonical diwarisi dari layout ("/") sehingga
  // Google menganggap /blog duplikat homepage dan tidak mengindeksnya.
  alternates: { canonical: "/blog" },
  // openGraph di halaman anak menggantikan milik layout seluruhnya, jadi
  // semua field (termasuk url) harus ditulis ulang di sini.
  openGraph: {
    title: "Notes — Pavernor",
    description: DESCRIPTION,
    url: "/blog",
    siteName: SITE_NAME,
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <main className="flex-1">
      <div className="px-5 pb-28 pt-32 sm:px-7 lg:pt-40">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="label text-muted">Notes</p>
            <h1 className="mt-5 text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.96] tracking-[-0.05em]">
              Notes, news
              <br />& ideas<span className="text-accent">.</span>
            </h1>
          </div>
          <p className="max-w-[380px] self-end border-l border-fg pl-4 text-[15px] leading-[1.5] lg:col-span-4 lg:col-start-9">
            Announcements, field notes, and ideas we&apos;re exploring — from
            the Pavernor team.
          </p>
        </div>

        {posts.length > 0 ? (
          <ul className="mt-20 border-t border-line">
            {posts.map((p, i) => (
              <li key={p.slug} className="border-b border-line">
                <Link
                  href={`/blog/${p.slug}`}
                  className="group grid items-center gap-5 py-7 sm:grid-cols-[3rem_minmax(0,1fr)_200px] sm:gap-8 lg:grid-cols-[3rem_minmax(0,1fr)_260px]"
                >
                  <span className="label hidden text-muted sm:block">0{i + 1}</span>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="label text-muted">{formatDate(p.date)}</span>
                      <span className="label text-accent">{p.category}</span>
                    </div>
                    <h2 className="mt-3 text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.08] tracking-[-0.035em] transition-colors group-hover:text-accent">
                      {p.title}
                    </h2>
                    <p className="mt-3 max-w-[620px] text-[15px] leading-[1.55] text-muted">{p.excerpt}</p>
                  </div>
                  <div className="w-full">
                    <NoteCover cover={p.cover} title={p.title} category={p.category} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-16 border-t border-line py-16 text-muted">No posts yet — check back soon.</p>
        )}
      </div>
    </main>
  );
}
