"use client";

import Link from "next/link";
import { useRef } from "react";
import NoteCover from "./NoteCover";

export type NoteCard = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  cover: string | null;
};

function Arrow({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={`size-4 ${dir === "prev" ? "rotate-180" : ""}`}>
      <path d="M3 10h13M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/* "The Research" card rail (Anveril pattern) fed by the markdown blog. */
export default function NotesCarousel({ notes }: { notes: NoteCard[] }) {
  const railRef = useRef<HTMLUListElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector("li");
    const step = (card?.getBoundingClientRect().width ?? 360) + 20;
    rail.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div>
      <ul
        ref={railRef}
        className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:-mx-7 sm:px-7 [&::-webkit-scrollbar]:hidden"
      >
        {notes.map((n) => (
          <li key={n.slug} className="w-[min(82vw,400px)] shrink-0 snap-start">
            <Link href={`/blog/${n.slug}`} className="group block">
              <NoteCover cover={n.cover} title={n.title} category={n.category} />
              <div className="mt-4 flex items-center gap-3">
                <span className="label text-muted">{n.date}</span>
                <span className="label text-accent">{n.category}</span>
              </div>
              <h3 className="mt-2 text-[19px] leading-[1.25] tracking-[-0.02em] transition-colors group-hover:text-accent">
                {n.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-[14px] leading-[1.5] text-muted">{n.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-between gap-4">
        <Link href="/blog" className="link-u text-[14px]">
          All notes
        </Link>
        <div className="flex gap-3">
          <button
            type="button"
            aria-label="Previous notes"
            onClick={() => scrollBy(-1)}
            className="grid size-12 place-items-center rounded-full bg-fg text-bg transition-colors hover:bg-accent"
          >
            <Arrow dir="prev" />
          </button>
          <button
            type="button"
            aria-label="Next notes"
            onClick={() => scrollBy(1)}
            className="grid size-12 place-items-center rounded-full bg-fg text-bg transition-colors hover:bg-accent"
          >
            <Arrow dir="next" />
          </button>
        </div>
      </div>
    </div>
  );
}
