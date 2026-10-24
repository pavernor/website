"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/*
 * Large centered statement whose words fill from faint to ink as it scrolls
 * through the viewport (Anveril "Deploys Intelligence…" pattern).
 */
export default function Statement({
  text,
  align = "center",
  className = "",
}: {
  text: string;
  align?: "center" | "left";
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-word]",
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.12,
            scrollTrigger: {
              trigger: ref.current,
              start: "top 85%",
              end: "bottom 45%",
              scrub: true,
            },
          },
        );
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <p
      ref={ref}
      className={`text-balance text-[clamp(2rem,4.4vw,3.9rem)] leading-[1.04] tracking-[-0.04em] ${
        align === "center" ? "mx-auto max-w-[19ch] text-center" : "max-w-[24ch]"
      } ${className}`}
    >
      {words.map((w, i) => (
        <span key={i} data-word>
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
