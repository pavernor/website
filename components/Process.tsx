"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import DotSphere from "./DotSphere";
import Corners from "./Corners";

const STEPS = [
  {
    tag: "Discover",
    title: "Map where agents pay off",
    body: "Two weeks inside your operation. We interview the people doing the work, trace the systems, and leave with a scored map of where agents create real leverage.",
    duration: "2 weeks",
  },
  {
    tag: "Prototype",
    title: "A working agent, fast",
    body: "The first agent runs in your environment — not on a slide. Real tools, real data, real guardrails, with people kept in the loop where it matters.",
    duration: "2–3 weeks",
  },
  {
    tag: "Harden",
    title: "Make it trustworthy",
    body: "Eval suites, guardrails, and observability turn a promising prototype into a system your team can bet on — every release measured against a quality bar.",
    duration: "4 weeks",
  },
  {
    tag: "Operate",
    title: "Ship, watch, hand over",
    body: "Production rollout with monitoring and iteration cycles, then a full handover — docs, playbooks, and your engineers in control.",
    duration: "Ongoing",
  },
];

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const st = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${(STEPS.length - 0.4) * window.innerHeight * 0.8}`,
          pin: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const i = Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length));
            setActive((prev) => (prev === i ? prev : i));
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
  }, []);

  const goTo = (i: number) => {
    const st = stRef.current;
    if (!st) return setActive(i);
    const y = st.start + ((st.end - st.start) * (i + 0.5)) / STEPS.length;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const step = STEPS[active];

  return (
    <section id="process" ref={sectionRef} aria-label="How we work" className="relative">
      {/* interactive pinned screen */}
      <div className="relative flex h-[100svh] min-h-[640px] flex-col px-5 pb-8 pt-20 motion-reduce:hidden sm:px-7 lg:pt-16">
        <Corners tl="02" tr="P" bl="Discover → Operate" br="Pavernor" />

        <div className="flex flex-col items-center gap-4">
          <p className="label text-muted">How we work</p>
          <div className="flex gap-2" aria-hidden="true">
            {STEPS.map((s, i) => (
              <span
                key={s.tag}
                className={`h-[2px] rounded-full transition-all duration-500 ${
                  i === active ? "w-7 bg-fg" : "w-2 bg-line-strong"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="grid flex-1 items-center gap-6 lg:grid-cols-12">
          <div className="mx-auto w-[min(72vw,46svh)] lg:col-span-5 lg:w-full lg:max-w-[460px]">
            <DotSphere step={active} />
          </div>

          <div className="relative min-h-[210px] lg:col-span-4 lg:col-start-7">
            {STEPS.map((s, i) => (
              <div
                key={s.tag}
                aria-hidden={i !== active}
                className={`transition-[opacity,translate] duration-500 ${
                  i === active
                    ? "relative opacity-100"
                    : "pointer-events-none absolute inset-x-0 top-0 translate-y-3 opacity-0"
                }`}
              >
                <p className="label text-accent">
                  0{i + 1} / {s.tag}
                </p>
                <h3 className="mt-4 text-[clamp(1.5rem,2.3vw,2rem)] leading-[1.1] tracking-[-0.03em]">
                  {s.title}
                </h3>
                <p className="mt-4 max-w-[420px] text-[15px] leading-[1.55] text-muted">
                  {s.body}
                </p>
              </div>
            ))}
          </div>

          <ul className="hidden flex-col items-end gap-2.5 lg:col-span-2 lg:col-start-11 lg:flex">
            {STEPS.map((s, i) => (
              <li key={s.tag}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  className={`flex items-center gap-2 text-[13px] transition-colors ${
                    i === active ? "text-fg" : "text-faint hover:text-muted"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`size-1 rounded-full bg-current transition-opacity ${
                      i === active ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {s.tag}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <p className="label text-center text-muted">
          Phase duration — <span className="text-fg">{step.duration}</span>
        </p>
      </div>

      {/* reduced-motion: static list */}
      <div className="hidden px-5 py-24 motion-reduce:block sm:px-7">
        <p className="label text-muted">How we work</p>
        <ol className="mt-10 grid gap-10 md:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.tag} className="border-t border-line pt-6">
              <p className="label text-accent">
                0{i + 1} / {s.tag} · {s.duration}
              </p>
              <h3 className="mt-3 text-2xl tracking-[-0.03em]">{s.title}</h3>
              <p className="mt-3 max-w-[460px] text-[15px] leading-[1.55] text-muted">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
