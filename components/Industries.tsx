"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import PixelSwap from "./PixelSwap";
import Corners from "./Corners";

const INDUSTRIES = [
  {
    name: "Logistics",
    title: "Building agents for logistics operations",
    body: "Freight, 3PL and last-mile teams use our agents to plan dispatch, chase shipment exceptions and keep customers updated — across the TMS, spreadsheets and chat they already run.",
  },
  {
    name: "Financial services",
    title: "Building agents for financial operations",
    body: "Agents that read applications, reconcile statements and prepare compliance checks, with every decision logged and traceable for audit.",
  },
  {
    name: "Retail & commerce",
    title: "Building agents for retail & commerce",
    body: "From catalogue enrichment to order exceptions and customer service — agents that work across marketplaces, ERP and support desks.",
  },
];

const IMAGES = [
  { src: "/images/ind-logistics.webp", alt: "Warehouse staff scanning stock between tall racks" },
  { src: "/images/ind-finance.webp", alt: "Bank back-office operations floor in Jakarta" },
  { src: "/images/ind-retail.webp", alt: "Parcels lined up on a conveyor at a fulfilment centre" },
];

/* Large faded segmented ring behind the switcher (our own SVG). */
function Ring() {
  const segs = 14;
  return (
    <svg viewBox="-100 -100 200 200" aria-hidden="true" className="h-full w-full">
      {Array.from({ length: segs }).map((_, i) => {
        const a0 = (i / segs) * Math.PI * 2;
        const a1 = a0 + (Math.PI * 2) / segs - 0.05;
        const r0 = i % 3 === 0 ? 52 : 64;
        const r1 = 96;
        const p = (r: number, a: number) => `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;
        return (
          <path
            key={i}
            d={`M ${p(r0, a0)} L ${p(r1, a0)} A ${r1} ${r1} 0 0 1 ${p(r1, a1)} L ${p(r0, a1)} A ${r0} ${r0} 0 0 0 ${p(r0, a0)} Z`}
            fill="currentColor"
          />
        );
      })}
    </svg>
  );
}

export default function Industries() {
  const sectionRef = useRef<HTMLElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const n = INDUSTRIES.length;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const st = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${(n - 0.4) * window.innerHeight * 0.75}`,
          pin: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const i = Math.min(n - 1, Math.floor(self.progress * n));
            setActive((prev) => (prev === i ? prev : i));
            if (ringRef.current) ringRef.current.style.transform = `rotate(${self.progress * 70}deg)`;
          },
        });
        stRef.current = st;
        return () => {
          stRef.current = null;
          st.kill();
        };
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [n]);

  const goTo = (i: number) => {
    const st = stRef.current;
    if (!st) return setActive(i);
    window.scrollTo({ top: st.start + ((st.end - st.start) * (i + 0.5)) / n, behavior: "smooth" });
  };

  return (
    <section id="industries" ref={sectionRef} aria-label="Industries" className="relative overflow-hidden">
      <div className="relative flex min-h-[100svh] flex-col px-5 pb-10 pt-20 sm:px-7 lg:h-[100svh] lg:min-h-[640px] lg:pt-16 motion-reduce:h-auto">
        <div
          ref={ringRef}
          className="pointer-events-none absolute -left-[38vmax] top-1/2 size-[90vmax] -translate-y-1/2 text-fg/[0.035] will-change-transform"
        >
          <Ring />
        </div>
        <Corners tl="03" tr="I" bl="Industries" br="SEA" />

        <p className="label relative text-center text-muted">Industries we build for</p>

        <div className="relative grid flex-1 items-center gap-8 py-8 lg:grid-cols-12 lg:gap-6 lg:py-0">
          {/* list */}
          <ul className="hidden flex-col gap-2 motion-reduce:flex lg:col-span-2 lg:col-start-2 lg:flex">
            {INDUSTRIES.map((ind, i) => (
              <li key={ind.name}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  className={`flex items-center gap-2 text-[13px] transition-colors duration-300 ${
                    i === active ? "text-fg" : "text-faint hover:text-muted"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`size-1 rounded-full bg-current transition-opacity ${i === active ? "opacity-100" : "opacity-0"}`}
                  />
                  {ind.name}
                </button>
              </li>
            ))}
          </ul>

          {/* image + pager */}
          <div className="flex items-end justify-center gap-4 lg:col-span-4 lg:col-start-5">
            <div className="relative aspect-[3/4] w-[min(78vw,44svh)] overflow-hidden rounded-[4px] bg-surface lg:w-[min(100%,46svh)]">
              <PixelSwap images={IMAGES} index={active} />
            </div>
            <div className="flex flex-col gap-1.5 pb-1" aria-hidden="true">
              {INDUSTRIES.map((ind, i) => (
                <span
                  key={ind.name}
                  className={`w-[2px] rounded-full transition-all duration-500 ${
                    i === active ? "h-6 bg-fg" : "h-1.5 bg-line-strong"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* text */}
          <div className="relative min-h-[190px] lg:col-span-3 lg:col-start-9">
            {INDUSTRIES.map((ind, i) => (
              <div
                key={ind.name}
                aria-hidden={i !== active}
                className={`transition-[opacity,translate] duration-500 ${
                  i === active
                    ? "relative opacity-100"
                    : "pointer-events-none absolute inset-x-0 top-0 translate-y-3 opacity-0"
                }`}
              >
                <p className="label text-muted lg:hidden">
                  0{i + 1} / 0{n} — {ind.name}
                </p>
                <h3 className="mt-3 max-w-[22ch] text-[clamp(1.25rem,1.7vw,1.5rem)] leading-[1.15] tracking-[-0.025em] lg:mt-0">
                  {ind.title}
                </h3>
                <p className="mt-4 max-w-[400px] text-[15px] leading-[1.55] text-muted">{ind.body}</p>
                <a href="#contact" className="link-u mt-6 inline-block text-[13px]">
                  Discuss your operation
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
