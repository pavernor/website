"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/*
 * Schematic for a blueprint case: inputs → agents → human checkpoint →
 * systems of record. Blueprints are reference architectures, so they get a
 * diagram rather than a photo that would imply a real client.
 */
export type BlueprintSpec = {
  name: string;
  inputs: string[];
  agents: string[];
  human: string;
  outputs: string[];
};

const W = 360;
const H = 450;
const BOX_H = 30;

type Box = { x: number; y: number; w: number; label: string };

function row(labels: string[], y: number, w = 100): Box[] {
  const gap = (W - 40 - labels.length * w) / Math.max(labels.length - 1, 1);
  const total = labels.length * w + (labels.length - 1) * gap;
  const x0 = labels.length === 1 ? (W - w) / 2 : (W - total) / 2;
  return labels.map((label, i) => ({ x: x0 + i * (w + gap), y, w, label }));
}

function link(a: Box, b: Box) {
  const x1 = a.x + a.w / 2;
  const y1 = a.y + BOX_H;
  const x2 = b.x + b.w / 2;
  const y2 = b.y;
  const my = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`;
}

export default function Blueprint({ spec }: { spec: BlueprintSpec }) {
  const ref = useRef<SVGSVGElement>(null);

  const inputs = row(spec.inputs, 62);
  const agents = row(spec.agents, 168, 130);
  const human = row([spec.human], 274, 170)[0];
  const outputs = row(spec.outputs, 380);

  const paths = [
    ...inputs.flatMap((a) => agents.map((b) => link(a, b))),
    ...agents.map((a) => link(a, human)),
    ...outputs.map((b) => link(human, b)),
  ];
  const pulse = [link(inputs[0], agents[0]), link(agents[0], human), link(human, outputs[0])];

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const lines = svg.querySelectorAll<SVGPathElement>("[data-bp-line]");
        lines.forEach((p) => {
          const len = p.getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: svg, start: "top 70%", once: true },
        });
        tl.from(svg.querySelectorAll("[data-bp-node]"), {
          opacity: 0,
          y: 8,
          duration: 0.5,
          stagger: 0.05,
          ease: "power2.out",
        }).to(lines, { strokeDashoffset: 0, duration: 0.9, stagger: 0.03, ease: "power2.inOut" }, 0.2);
      });
    }, svg);
    return () => ctx.revert();
  }, []);

  const node = (b: Box, kind: "in" | "agent" | "human" | "out", k: string) => (
    <g key={k} data-bp-node>
      {kind === "human" ? (
        <rect x={b.x} y={b.y} width={b.w} height={BOX_H} rx={BOX_H / 2} fill="#f2f1ee" stroke="#17160f" strokeWidth="1" />
      ) : (
        <rect
          x={b.x}
          y={b.y}
          width={b.w}
          height={BOX_H}
          rx="2"
          fill={kind === "agent" ? "#0038ff" : "#f2f1ee"}
          stroke={kind === "agent" ? "#0038ff" : "rgba(23,22,15,0.35)"}
          strokeWidth="1"
          strokeDasharray={kind === "out" ? "3 2" : undefined}
        />
      )}
      {kind === "human" && <circle cx={b.x + 16} cy={b.y + BOX_H / 2} r="4" fill="#17160f" />}
      <text
        x={kind === "human" ? b.x + b.w / 2 + 6 : b.x + b.w / 2}
        y={b.y + BOX_H / 2 + 3.5}
        textAnchor="middle"
        fontSize="9.5"
        fill={kind === "agent" ? "#ffffff" : "#17160f"}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {b.label}
      </text>
    </g>
  );

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-surface bg-[radial-gradient(rgba(23,22,15,0.13)_1px,transparent_1px)] [background-size:18px_18px]">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Blueprint for ${spec.name}: ${spec.inputs.join(", ")} feed ${spec.agents.join(" and ")}; ${spec.human}; results written to ${spec.outputs.join(", ")}.`}
        className="h-auto w-[min(92%,560px)]"
      >
        {paths.map((d, i) => (
          <path key={i} data-bp-line d={d} fill="none" stroke="rgba(23,22,15,0.45)" strokeWidth="0.9" />
        ))}
        {pulse.map((d, i) => (
          <circle key={`p${i}`} r="2.6" fill="#0038ff" className="motion-reduce:hidden">
            <animateMotion dur="2.4s" begin={`${i * 0.8}s`} repeatCount="indefinite" path={d} />
          </circle>
        ))}
        {[
          ["Inputs", 50],
          ["Agents", 156],
          ["Checkpoint", 262],
          ["Systems of record", 368],
        ].map(([t, y]) => (
          <text
            key={t}
            x="20"
            y={y}
            fontSize="8"
            fill="#67655c"
            stroke="#e8e6e0"
            strokeWidth="4"
            paintOrder="stroke"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {String(t).toUpperCase()}
          </text>
        ))}
        {inputs.map((b, i) => node(b, "in", `i${i}`))}
        {agents.map((b, i) => node(b, "agent", `a${i}`))}
        {node(human, "human", "h")}
        {outputs.map((b, i) => node(b, "out", `o${i}`))}
      </svg>
    </div>
  );
}
