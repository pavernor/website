"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { Mark } from "./Logo";

const COLS = [
  {
    title: "Company",
    links: [
      { href: "/#services", label: "Services" },
      { href: "/#industries", label: "Industries" },
      { href: "/#work", label: "Work" },
      { href: "/#about", label: "About" },
    ],
  },
  {
    title: "Notes",
    links: [
      { href: "/blog", label: "All notes" },
      { href: "/feed.xml", label: "RSS feed" },
      { href: "/blog/evals-before-features", label: "Evals before features" },
    ],
  },
  {
    title: "Contact",
    links: [
      { href: "mailto:alvin@pavernor.site", label: "Email us" },
      { href: "mailto:alvin@pavernor.site?subject=Discovery%20call", label: "Book a call" },
      { href: "https://notemae.pavernor.tech", label: "Notemae ↗" },
    ],
  },
];

/* Dark closing band + colossal wordmark (Anveril footer pattern). */
export default function Footer() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-wordmark]",
          { yPercent: 35 },
          {
            yPercent: 0,
            ease: "none",
            scrollTrigger: { trigger: "[data-wordmark]", start: "top bottom", end: "bottom bottom", scrub: true },
          },
        );
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer id="contact" ref={rootRef} className="relative overflow-hidden bg-ink text-cream">
      <div className="px-5 pt-20 sm:px-7 lg:pt-24">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-[clamp(2rem,3.4vw,3rem)] leading-[1.02] tracking-[-0.045em]">
              Tell us the workflow
              <br />
              that hurts.
            </h2>
            <p className="mt-5 max-w-[400px] text-[15px] leading-[1.55] text-cream-muted">
              We&apos;ll come back with a map of where agents pay off — and what
              it takes to get there. First call is free, no deck required.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="mailto:alvin@pavernor.site?subject=Discovery%20call"
                className="rounded-full bg-cream px-5 py-2.5 text-[14px] text-ink transition-colors hover:bg-accent hover:text-white"
              >
                Book a discovery call
              </a>
              <a
                href="mailto:alvin@pavernor.site"
                className="rounded-full border border-cream-line px-5 py-2.5 text-[14px] transition-colors hover:border-cream"
              >
                alvin@pavernor.site
              </a>
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
            {COLS.map((c) => (
              <div key={c.title}>
                <p className="text-[14px]">{c.title}</p>
                <ul className="mt-5 space-y-2 text-[14px] text-cream-muted lg:mt-10">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      {l.href.startsWith("/") && !l.href.endsWith(".xml") ? (
                        <Link href={l.href} className="transition-colors hover:text-cream">
                          {l.label}
                        </Link>
                      ) : (
                        <a href={l.href} className="transition-colors hover:text-cream">
                          {l.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-16 flex flex-wrap items-end justify-between gap-4 text-[14px] text-cream-muted lg:mt-20">
          <p>
            Jakarta — Indonesia
            <br />
            Remote — Southeast Asia
          </p>
          <p className="text-right">
            pavernor.tech
            <br />© 2026 Pavernor
          </p>
        </div>
      </div>

      <div className="mt-10 overflow-hidden px-3 sm:px-5" aria-hidden="true">
        <p
          data-wordmark
          className="flex items-end gap-[0.04em] whitespace-nowrap text-[clamp(4.5rem,20vw,24rem)] font-medium leading-[0.78] tracking-[-0.065em]"
        >
          <Mark className="mb-[0.06em] size-[0.62em] shrink-0" />
          Pavernor
        </p>
      </div>
    </footer>
  );
}
