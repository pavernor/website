"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import Corners from "./Corners";

const SERVICES = [
  {
    name: "Agentic Strategy",
    module: "STRATEGY",
    headline: "Find where autonomy pays off.",
    body: "We map your workflows, score them for autonomy potential, and tie every agent on the roadmap to a P&L line — not a demo.",
    deliverables: ["Opportunity map", "ROI model", "Agent roadmap", "Risk brief"],
    timeline: "2–3 weeks",
  },
  {
    name: "Agent Engineering",
    module: "AGENT-OPS",
    headline: "Systems that reason and act.",
    body: "Multi-agent architectures with tool use, memory, and human-in-the-loop control — built on the models you choose, and owned by you.",
    deliverables: ["Multi-agent orchestration", "Tool & MCP integration", "Memory & retrieval", "Human-in-the-loop"],
    timeline: "3–6 weeks",
  },
  {
    name: "AI Integration",
    module: "INTEGRATE",
    headline: "Agents inside your stack.",
    body: "We wire agents into the systems you already run — ERP, CRM, data platforms — so they read, decide, and write where the work happens.",
    deliverables: ["System connectors", "Data pipelines", "Auth & audit trails", "Legacy bridges"],
    timeline: "2–5 weeks",
  },
  {
    name: "Evaluation & Governance",
    module: "EVAL-OPS",
    headline: "Trust, measured.",
    body: "Eval suites, guardrails, and observability that make agent behaviour measurable — before, during, and after production.",
    deliverables: ["Eval harness", "Guardrail policies", "Observability dashboards", "Compliance packs"],
    timeline: "2–4 weeks",
  },
  {
    name: "Team Enablement",
    module: "ENABLE",
    headline: "Your engineers, agent-native.",
    body: "Co-development, training, and playbooks that leave your team shipping agents long after we're gone.",
    deliverables: ["Co-dev sprints", "Engineer training", "Ops playbooks", "Architecture reviews"],
    timeline: "Ongoing",
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const stRef = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const n = SERVICES.length;

  useEffect(() => {
    const items = itemsRef.current;
    const apply = (p: number) => {
      items.forEach((el, i) => {
        if (!el) return;
        const d = i - p;
        const ad = Math.abs(d);
        el.style.transform = `translate3d(0, ${d * 100}%, 0) rotateX(${-d * 17}deg)`;
        el.style.opacity = String(Math.max(0, 1 - ad * 0.36));
        el.style.color = ad < 0.5 ? "var(--color-fg)" : "rgba(23,22,15,0.3)";
      });
    };
    apply(0);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const proxy = { p: 0 };
        const setP = gsap.quickTo(proxy, "p", {
          duration: 0.55,
          ease: "power3.out",
          onUpdate: () => apply(proxy.p),
        });
        const st = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${(n - 0.5) * window.innerHeight * 0.7}`,
          pin: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress * (n - 1);
            setP(p);
            const i = Math.round(p);
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
  }, [n]);

  const goTo = (i: number) => {
    const st = stRef.current;
    if (!st) return setActive(i);
    window.scrollTo({ top: st.start + ((st.end - st.start) * i) / (n - 1), behavior: "smooth" });
  };

  const s = SERVICES[active];

  return (
    <section id="services" ref={sectionRef} aria-label="Services" className="relative">
      <div className="relative flex h-[100svh] min-h-[640px] flex-col px-5 pb-8 pt-20 motion-reduce:hidden sm:px-7 lg:pt-16">
        <Corners tl="04" tr="S" bl="Pavernor" br="What we build" />
        <p className="label text-center text-muted">What we build</p>

        <div className="grid flex-1 grid-rows-[auto_1fr_auto] items-center gap-6 lg:grid-cols-12 lg:grid-rows-1">
          {/* index */}
          <div className="flex items-baseline justify-between lg:col-span-2 lg:block">
            <p className="text-[clamp(3rem,6vw,5.5rem)] leading-none tracking-[-0.05em] tabular-nums">
              0{active + 1}
              <span className="text-faint">/0{n}</span>
            </p>
            <p className="label text-accent lg:mt-4">[ {s.module} ]</p>
          </div>

          {/* wheel */}
          <div className="relative h-full max-h-[460px] min-h-[220px] [perspective:1000px] lg:col-span-6 lg:col-start-4">
            <div className="absolute inset-0 [mask-image:linear-gradient(180deg,transparent,black_28%,black_72%,transparent)]">
              {SERVICES.map((sv, i) => (
                <button
                  key={sv.name}
                  ref={(el) => {
                    itemsRef.current[i] = el;
                  }}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === active}
                  className="absolute inset-x-0 top-1/2 -mt-[0.6em] block h-[1.2em] text-center text-[clamp(1.75rem,3.6vw,3.25rem)] leading-[1.2] tracking-[-0.04em] [backface-visibility:hidden] will-change-transform"
                >
                  {sv.name}
                </button>
              ))}
            </div>
          </div>

          {/* detail */}
          <div className="relative min-h-[220px] lg:col-span-3 lg:col-start-10">
            {SERVICES.map((sv, i) => (
              <div
                key={sv.name}
                aria-hidden={i !== active}
                className={`transition-[opacity,translate] duration-500 ${
                  i === active
                    ? "relative opacity-100"
                    : "pointer-events-none absolute inset-x-0 top-0 translate-y-3 opacity-0"
                }`}
              >
                <h3 className="text-[clamp(1.2rem,1.6vw,1.45rem)] leading-[1.15] tracking-[-0.025em]">
                  {sv.headline}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.55] text-muted">{sv.body}</p>
                <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-line pt-4 text-[13px] lg:grid-cols-1">
                  {sv.deliverables.map((d) => (
                    <li key={d} className="flex gap-2">
                      <span aria-hidden="true" className="text-accent">
                        —
                      </span>
                      {d}
                    </li>
                  ))}
                </ul>
                <p className="label mt-5 text-muted">
                  Typical timeline — <span className="text-fg">{sv.timeline}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* reduced-motion: static list */}
      <div className="hidden px-5 py-24 motion-reduce:block sm:px-7">
        <p className="label text-muted">What we build</p>
        <ol className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((sv, i) => (
            <li key={sv.name} className="border-t border-line pt-6">
              <p className="label text-accent">
                0{i + 1} / {sv.module}
              </p>
              <h3 className="mt-3 text-2xl tracking-[-0.03em]">{sv.name}</h3>
              <p className="mt-2 text-[15px] leading-[1.55] text-muted">
                {sv.headline} {sv.body}
              </p>
              <p className="mt-3 text-[13px]">{sv.deliverables.join(" · ")}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
