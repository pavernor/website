"use client";

import { useEffect, useRef } from "react";

/*
 * Rotating dot sphere (Anveril process visual, rebuilt in Canvas 2D).
 * Each process step lights a different subset of dots:
 *   0 Discover  – scattered signals
 *   1 Prototype – one dense cluster
 *   2 Harden    – three structured rings
 *   3 Operate   – the whole surface, evenly lit
 */
const N = 460;

function fibonacci(n: number) {
  const pts: [number, number, number][] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = phi * i;
    pts.push([Math.cos(t) * r, y, Math.sin(t) * r]);
  }
  return pts;
}

// deterministic pseudo-random so SSR/CSR and reloads match
function rand(i: number) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function targetsFor(step: number, pts: [number, number, number][]) {
  return pts.map(([x, y, z], i) => {
    switch (step) {
      case 0:
        return rand(i) < 0.13 ? 2.6 : 1;
      case 1: {
        const d = Math.hypot(x - 0.55, y - 0.35, z - 0.75);
        return d < 0.62 ? 2.5 : 1;
      }
      case 2: {
        const band = Math.min(Math.abs(y - 0.55), Math.abs(y), Math.abs(y + 0.55));
        return band < 0.06 ? 2.5 : 1;
      }
      default:
        return 1.75;
    }
  });
}

export default function DotSphere({ step }: { step: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stepRef = useRef(step);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pts = fibonacci(N);
    const sizes = new Float32Array(N).fill(1);
    const accent = new Set([17, 88, 143, 201, 266, 318, 377, 420]);
    let targets = targetsFor(stepRef.current, pts);
    let lastStep = stepRef.current;
    let angle = 0.6;
    let raf = 0;
    let visible = true;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const tilt = 0.32;
    const ct = Math.cos(tilt);
    const st = Math.sin(tilt);

    const draw = () => {
      if (stepRef.current !== lastStep) {
        lastStep = stepRef.current;
        targets = targetsFor(lastStep, pts);
      }
      ctx.clearRect(0, 0, w, h);
      const R = Math.min(w, h) * 0.46;
      const cx = w / 2;
      const cy = h / 2;
      const ca = Math.cos(angle);
      const sa = Math.sin(angle);
      const base = Math.max(1.05, R / 150);
      for (let i = 0; i < N; i++) {
        sizes[i] += (targets[i] - sizes[i]) * (reduced ? 1 : 0.08);
        const [x, y, z] = pts[i];
        const x1 = x * ca + z * sa;
        const z1 = -x * sa + z * ca;
        const y2 = y * ct - z1 * st;
        const z2 = y * st + z1 * ct;
        const depth = (z2 + 1) / 2; // 0 back … 1 front
        const lit = sizes[i] > 1.2;
        const r = base * sizes[i] * (0.45 + 0.55 * depth);
        ctx.globalAlpha = lit ? 0.35 + 0.65 * depth : 0.12 + 0.5 * depth;
        ctx.fillStyle = lit && accent.has(i) ? "#0038ff" : "#17160f";
        ctx.beginPath();
        ctx.arc(cx + x1 * R, cy + y2 * R, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      angle += 0.0022;
      draw();
      raf = requestAnimationFrame(loop);
    };

    resize();
    draw();
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);

    let io: IntersectionObserver | undefined;
    if (!reduced) {
      io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        cancelAnimationFrame(raf);
        if (visible) raf = requestAnimationFrame(loop);
      });
      io.observe(canvas);
    }

    // reduced motion: redraw only when the step changes
    const poll = reduced
      ? window.setInterval(() => {
          if (stepRef.current !== lastStep) draw();
        }, 200)
      : 0;

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
      if (poll) window.clearInterval(poll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="block aspect-square w-full"
    />
  );
}
