import Hero from "@/components/Hero";
import Statement from "@/components/Statement";
import Process from "@/components/Process";
import Industries from "@/components/Industries";
import Services from "@/components/Services";
import Work from "@/components/Work";
import Beliefs from "@/components/Beliefs";
import NotesCarousel from "@/components/NotesCarousel";
import { getAllPosts, formatDate } from "@/lib/blog";

/*
 * Section rhythm follows the Anveril reference (picked by the OpenCode
 * Awwwards research, .design/awwwards-opencode/2026-10-17/): hero stage →
 * statement → pinned process → statement → industry switcher → service
 * wheel → Bottleneck→System cases → CTA → notes rail → manifesto → footer.
 */
export default function Home() {
  const notes = getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    date: formatDate(p.date),
    cover: p.cover,
  }));

  return (
    <main className="flex-1">
      <Hero />

      <section aria-label="What Pavernor does" className="px-5 py-[24svh] sm:px-7">
        <Statement text="Pavernor puts AI agents to work inside the operations you already run." />
      </section>

      <Process />

      <section aria-label="Where we work" className="px-5 py-[24svh] sm:px-7">
        <Statement text="Built for the operations that keep Southeast Asia moving." />
      </section>

      <Industries />
      <Services />
      <Work />

      <section aria-label="Start a project" className="px-5 py-[22svh] text-center sm:px-7">
        <h2 className="mx-auto max-w-[16ch] text-balance text-[clamp(2.25rem,4.6vw,4rem)] leading-[1] tracking-[-0.045em]">
          Put software to work<span className="text-accent">.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-[440px] text-[15px] leading-[1.55] text-muted">
          First agent in production within weeks, not quarters — scoped
          against an outcome you already measure.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="#contact"
            className="rounded-full bg-fg px-5 py-2.5 text-[14px] text-bg transition-colors hover:bg-accent"
          >
            Book a discovery call
          </a>
          <a
            href="#services"
            className="rounded-full bg-surface px-5 py-2.5 text-[14px] transition-colors hover:bg-line-strong"
          >
            Explore services
          </a>
        </div>
      </section>

      <section id="notes" aria-label="Notes" className="border-t border-line px-5 pb-20 pt-24 sm:px-7 lg:pt-32">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label text-muted">06 — Notes</p>
            <h2 className="mt-5 text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.02] tracking-[-0.045em]">
              Field notes from the work.
            </h2>
          </div>
          <p className="max-w-[340px] text-[15px] leading-[1.5] text-muted">
            Announcements, field notes, and the ideas we&apos;re betting on.
          </p>
        </div>
        <NotesCarousel notes={notes} />
      </section>

      <Beliefs />
    </main>
  );
}
