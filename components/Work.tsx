"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import Blueprint, { type BlueprintSpec } from "./Blueprint";

/*
 * Case studies in the Anveril "Bottleneck → System" layout. Notemae is a live
 * Pavernor product; the others are blueprints (reference architectures, no
 * client names or invented metrics) until real case data is published —
 * they show an architecture schematic instead of a photo.
 */
type Case = {
  tag: string;
  title: string;
  bottleneck: string;
  system: string;
  href?: string;
  linkLabel?: string;
  img?: string;
  alt?: string;
  blueprint?: BlueprintSpec;
};

const CASES: Case[] = [
  {
    tag: "Live product · Consumer web",
    title: "Notemae",
    bottleneck:
      "Shoppers want designer scents at a sensible price, but dupe advice is scattered across forums, videos and marketplace reviews.",
    system:
      "A curated, searchable guide that pairs designer perfumes with affordable alternatives — designed, built and operated end-to-end by Pavernor.",
    href: "https://notemae.pavernor.tech",
    linkLabel: "Visit notemae.pavernor.tech",
    img: "/images/case-notemae.webp",
    alt: "Three unlabelled perfume bottles on a paper-white surface",
  },
  {
    tag: "Blueprint · Logistics",
    title: "Dispatch Copilot",
    bottleneck:
      "Planners juggle orders, fleet availability and customer promises across spreadsheets, chat groups and a legacy TMS — every exception costs an hour.",
    system:
      "A multi-agent copilot that drafts the daily dispatch plan, flags conflicts and messages customers, with a planner approving every change.",
    blueprint: {
      name: "Dispatch Copilot",
      inputs: ["Orders · ERP", "Fleet status", "Chat requests"],
      agents: ["Planning agent", "Comms agent"],
      human: "Planner approves",
      outputs: ["TMS", "Customer updates", "Audit log"],
    },
  },
  {
    tag: "Blueprint · Insurance",
    title: "Claims Intake Agents",
    bottleneck:
      "Claims arrive as photos, PDFs and emails across dozens of channels, and staff re-key the same data into three systems.",
    system:
      "Document agents that classify, extract and validate each submission, route edge cases to people, and write clean records into the core system.",
    blueprint: {
      name: "Claims Intake Agents",
      inputs: ["Email", "Photos · PDFs", "Web forms"],
      agents: ["Classify & extract", "Validate"],
      human: "Adjuster reviews",
      outputs: ["Claims core", "Case file", "Audit log"],
    },
  },
  {
    tag: "Blueprint · Field service",
    title: "Repair Brain",
    bottleneck:
      "Technicians lose time hunting through decades of manuals and job notes before they can even start a fix.",
    system:
      "A retrieval agent over manuals and job history that proposes a diagnosis, parts list and steps — and learns from every closed ticket.",
    blueprint: {
      name: "Repair Brain",
      inputs: ["Manuals", "Job history", "New ticket"],
      agents: ["Retrieval agent", "Diagnosis agent"],
      human: "Technician confirms",
      outputs: ["Work order", "Parts list", "Knowledge base"],
    },
  },
];

export default function Work() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-case]").forEach((el) => {
          const img = el.querySelector("[data-case-img]");
          if (img) gsap.fromTo(
            img,
            { yPercent: -6 },
            {
              yPercent: 6,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
          gsap.fromTo(
            el.querySelectorAll("[data-case-word]"),
            { opacity: 0.16 },
            {
              opacity: 1,
              stagger: 0.2,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top 75%", end: "top 25%", scrub: true },
            },
          );
          gsap.from(el.querySelectorAll("[data-case-detail]"), {
            opacity: 0,
            y: 18,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 45%", once: true },
          });
        });
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="work" ref={rootRef} aria-label="Selected work" className="relative px-5 pb-12 pt-28 sm:px-7 lg:pt-40">
      <div className="mb-14 grid gap-6 lg:mb-20 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="label text-muted">05 — Selected work</p>
          <h2 className="mt-5 text-[clamp(2.25rem,4.6vw,4rem)] leading-[1] tracking-[-0.045em]">
            Bottleneck <span className="text-accent">→</span> System
          </h2>
        </div>
        <p className="max-w-[380px] self-end text-[15px] leading-[1.5] text-muted lg:col-span-4 lg:col-start-9">
          Notemae is live and run by us. The others are blueprints — reference
          architectures from our practice, shared without client names until
          the case studies are public.
        </p>
      </div>

      <div className="flex flex-col gap-16 lg:gap-6">
        {CASES.map((c, i) => (
          <article
            key={c.title}
            data-case
            className="grid gap-6 lg:min-h-[calc(100svh-3rem)] lg:grid-cols-12"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[4px] bg-surface lg:col-span-7 lg:aspect-auto">
              {c.blueprint ? (
                <Blueprint spec={c.blueprint} />
              ) : (
                <img
                  data-case-img
                  src={c.img}
                  alt={c.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-x-0 -top-[7%] h-[114%] w-full object-cover"
                />
              )}
              <span className="label absolute left-3 top-3 rounded-full bg-bg/85 px-2.5 py-1 backdrop-blur">
                0{i + 1}
              </span>
            </div>

            <div className="flex flex-col justify-between gap-10 border-line lg:col-span-5 lg:border-l lg:pl-6">
              <div>
                <p className="label flex items-center gap-2 text-muted">
                  {c.href && <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />}
                  {c.tag}
                </p>
                <h3 className="mt-4 text-[clamp(2rem,3.4vw,3rem)] leading-[1.02] tracking-[-0.045em]">
                  {c.title.split(" ").map((w, k, a) => (
                    <span key={k} data-case-word>
                      {w}
                      {k < a.length - 1 ? " " : ""}
                    </span>
                  ))}
                </h3>
              </div>

              <div className="grid gap-6">
                <div data-case-detail className="border-t border-line pt-4">
                  <p className="text-[14px] font-medium">Bottleneck</p>
                  <p className="mt-2 max-w-[460px] text-[15px] leading-[1.55] text-muted">{c.bottleneck}</p>
                </div>
                <div data-case-detail className="border-t border-line pt-4">
                  <p className="text-[14px] font-medium">System</p>
                  <p className="mt-2 max-w-[460px] text-[15px] leading-[1.55] text-muted">{c.system}</p>
                </div>
                {c.href && (
                  <a
                    data-case-detail
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-u self-start text-[14px] text-accent"
                  >
                    {c.linkLabel} ↗
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
