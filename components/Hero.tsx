"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/*
 * Hero (Anveril pattern): asymmetric headline + ruled intro, then a tall
 * media panel inset from the page gutters. As the panel rises to the top of
 * the viewport its insets close to full-bleed and an overlay title arrives.
 * Motion is our GSAP rebuild — the reference's Framer timings were not
 * measured.
 */
export default function Hero() {
  const stageRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const text = textRef.current;
    const media = mediaRef.current;
    if (!stage || !text || !media) return;

    // lets the ticker sit at the bottom of the first viewport
    const setTop = () => stage.style.setProperty("--hero-top", `${text.offsetHeight}px`);
    setTop();
    const ro = new ResizeObserver(() => {
      setTop();
      ScrollTrigger.refresh();
    });
    ro.observe(text);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-hero-line]", {
          yPercent: 105,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.09,
          delay: 0.1,
        });
        gsap.from("[data-hero-fade]", {
          opacity: 0,
          y: 14,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          delay: 0.45,
        });
        gsap.from(media, { opacity: 0, y: 30, duration: 1.2, ease: "power3.out", delay: 0.25 });

        const gutter = () => (window.innerWidth < 640 ? 20 : 28);
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: () => `+=${media.offsetTop}`,
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });
        tl.fromTo(
          media,
          { clipPath: () => `inset(0px ${gutter()}px 0px ${gutter()}px round 6px)` },
          { clipPath: "inset(0px 0px 0px 0px round 0px)", ease: "none" },
          0,
        )
          .fromTo("[data-hero-img]", { scale: 1.14 }, { scale: 1, ease: "none" }, 0)
          .to("[data-hero-ticker]", { opacity: 0, y: 24, ease: "none", duration: 0.3 }, 0)
          .fromTo(
            "[data-hero-title]",
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, ease: "none", duration: 0.4 },
            0.6,
          );
      });
    }, stage);

    return () => {
      ro.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section id="top" ref={stageRef} aria-label="Introduction" className="relative">
      <div
        ref={textRef}
        className="grid gap-7 px-5 pb-7 pt-[calc(4rem+clamp(2rem,9vh,6.5rem))] sm:px-7 lg:grid-cols-12 lg:items-end lg:gap-6 lg:pb-8"
      >
        <h1 className="text-[clamp(2.9rem,6.2vw,5.75rem)] font-normal leading-[0.96] tracking-[-0.045em] lg:col-span-7">
          <span className="block overflow-hidden pb-[0.06em]">
            <span data-hero-line className="block">
              Software
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.06em]">
            <span data-hero-line className="block">
              that acts<span className="text-accent">.</span>
            </span>
          </span>
        </h1>

        <div className="flex flex-col items-start gap-6 lg:col-span-4 lg:col-start-9 lg:pb-2">
          <p data-hero-fade className="max-w-[380px] border-l border-fg pl-4 text-[15px] leading-[1.45]">
            We partner with companies across Indonesia and Southeast Asia to
            redesign workflows, deploy AI agents, and keep them reliable in
            production.
          </p>
          <a
            data-hero-fade
            href="#contact"
            className="rounded-full bg-fg px-4 py-2 text-[13px] text-bg transition-colors hover:bg-accent"
          >
            Book a discovery call
          </a>
        </div>
      </div>

      <div
        ref={mediaRef}
        className="relative h-[100svh] min-h-[560px] overflow-hidden will-change-[clip-path] [clip-path:inset(0_20px_0_20px_round_6px)] sm:[clip-path:inset(0_28px_0_28px_round_6px)]"
      >
        <img
          data-hero-img
          src="/images/hero-port-1376.webp"
          srcSet="/images/hero-port-900.webp 900w, /images/hero-port-1376.webp 1376w"
          sizes="100vw"
          width={1376}
          height={768}
          alt="Aerial view of a container port at dawn — the kind of operation Pavernor builds agents for"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full origin-top object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,22,15,0.5)_0%,rgba(23,22,15,0)_40%,rgba(23,22,15,0)_75%,rgba(23,22,15,0.3)_100%)]"
        />

        <p
          data-hero-title
          className="absolute inset-x-5 top-[13svh] flex justify-between gap-x-6 text-[clamp(2.2rem,5vw,4.5rem)] leading-[0.98] tracking-[-0.04em] text-cream opacity-0 sm:inset-x-7 lg:justify-center lg:gap-x-[0.3em]"
        >
          <span>From workflow</span>
          <span className="text-right">to working agent.</span>
        </p>

        <div
          data-hero-ticker
          className="absolute inset-x-5 mx-auto flex max-w-[560px] items-center justify-between gap-4 rounded-[6px] bg-bg/85 py-2 pl-4 pr-2 backdrop-blur-md sm:inset-x-7"
          style={{ top: "max(16px, calc(100svh - var(--hero-top, 330px) - 84px))" }}
        >
          <p className="text-[13px] leading-snug">
            <span className="text-muted">Field note —</span> five workflows
            where agents pay off first.
          </p>
          <Link
            href="/blog/five-workflows-agents-pay-off"
            className="shrink-0 rounded-full bg-fg px-3.5 py-1.5 text-[12px] text-bg transition-colors hover:bg-accent"
          >
            Read more
          </Link>
        </div>
      </div>
    </section>
  );
}
