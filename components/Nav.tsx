"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import Logo from "./Logo";

const LINKS = [
  { href: "/#services", label: "Services" },
  { href: "/#industries", label: "Industries" },
  { href: "/#work", label: "Work" },
  { href: "/#process", label: "Process" },
  { href: "/blog", label: "Notes" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

/* 3×3 dot glyph next to "Menu" (Anveril pattern, rebuilt as our own SVG). */
function Dots({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 18 18"
      aria-hidden="true"
      className={`size-[18px] transition-transform duration-500 ${open ? "rotate-45" : "group-hover:rotate-90"}`}
    >
      {[3, 9, 15].flatMap((y) =>
        [3, 9, 15].map((x) => (
          <circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r={x === 9 && y === 9 ? 1.9 : 1.5}
            fill={x === 9 && y === 9 ? "var(--color-accent)" : "currentColor"}
          />
        )),
      )}
    </svg>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // hide on scroll down, show on scroll up
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 160 && y > last + 2);
      if (y < last - 2) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // menu open/close choreography + scroll lock + Esc
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open) {
      panel.querySelector<HTMLAnchorElement>("a")?.focus({ preventScroll: true });
      if (!reduced) {
        gsap.fromTo(
          panel.querySelectorAll("[data-menu-item]"),
          { yPercent: 110 },
          { yPercent: 0, duration: 0.8, stagger: 0.045, ease: "expo.out", delay: 0.1 },
        );
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[translate,background-color,border-color] duration-500 ${
          hidden && !open ? "-translate-y-full" : "translate-y-0"
        } ${
          scrolled && !open
            ? "border-b border-line bg-bg/80 backdrop-blur-md"
            : "border-b border-transparent"
        }`}
      >
        <nav className="flex h-16 items-center justify-between px-5 sm:px-7">
          <Link href="/#top" aria-label="Pavernor — home" onClick={() => setOpen(false)}>
            <Logo />
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/#contact"
              className="hidden rounded-full bg-fg px-4 py-2 text-[13px] text-bg transition-colors hover:bg-accent sm:block"
              onClick={() => setOpen(false)}
            >
              Book a call
            </Link>
            <button
              ref={btnRef}
              type="button"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen((v) => !v)}
              className="group flex items-center gap-2.5 py-2 text-[14px]"
            >
              {open ? "Close" : "Menu"}
              <Dots open={open} />
            </button>
          </div>
        </nav>
      </header>

      <div
        id="site-menu"
        ref={panelRef}
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-0 z-40 flex flex-col bg-bg px-5 pb-8 pt-24 transition-[clip-path] duration-700 ease-[cubic-bezier(.7,0,.2,1)] motion-reduce:transition-none sm:px-7 ${
          open ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(0_0_100%_0)]"
        }`}
      >
        <ul className="flex flex-1 flex-col justify-center">
          {LINKS.map((l, i) => (
            <li key={l.href} className="overflow-hidden border-b border-line first:border-t">
              <Link
                data-menu-item
                href={l.href}
                onClick={() => setOpen(false)}
                className="group flex items-baseline justify-between gap-6 py-2.5 sm:py-3"
              >
                <span className="text-[clamp(2rem,6.4vw,4.75rem)] leading-[1.05] tracking-[-0.04em] transition-[color,translate] duration-300 group-hover:translate-x-2 group-hover:text-accent">
                  {l.label}
                </span>
                <span className="label text-muted">0{i + 1}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4 text-[13px] text-muted">
          <a href="mailto:alvin@pavernor.site" className="link-u text-fg">
            alvin@pavernor.site
          </a>
          <span>Jakarta — Indonesia · Remote — Southeast Asia</span>
        </div>
      </div>
    </>
  );
}
