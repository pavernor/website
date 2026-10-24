"use client";

import { useEffect, useRef } from "react";

/*
 * Image panel that switches pictures through a tiled mosaic: each tile drops
 * from the old photo to a flat colour block, then resolves into the new
 * photo, with per-tile random delays (Anveril "Frontiers" transition,
 * rebuilt in Canvas 2D). Reduced motion swaps instantly.
 */
type Img = { src: string; alt: string };

const COLS = 9;
const DURATION = 950;

function rand(i: number) {
  const x = Math.sin(i * 91.17 + 4.31) * 24634.6345;
  return x - Math.floor(x);
}

function cover(img: HTMLImageElement, w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (!g || !img.naturalWidth) return c;
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  g.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  return c;
}

export default function PixelSwap({ images, index }: { images: Img[]; index: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const indexRef = useRef(index);
  const apiRef = useRef<{ go: (i: number) => void } | null>(null);

  useEffect(() => {
    indexRef.current = index;
    apiRef.current?.go(index);
  }, [index]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const els = images.map((im) => {
      const el = new Image();
      el.decoding = "async";
      el.src = im.src;
      return el;
    });
    let full: HTMLCanvasElement[] = [];
    let low: HTMLCanvasElement[] = [];
    let W = 0;
    let H = 0;
    let rows = 12;
    let cur = indexRef.current;
    let prev = cur;
    let start = 0;
    let raf = 0;

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(canvas.clientWidth * dpr));
      H = Math.max(1, Math.round(canvas.clientHeight * dpr));
      canvas.width = W;
      canvas.height = H;
      rows = Math.max(1, Math.round((COLS * H) / W));
      full = els.map((el) => cover(el, W, H));
      low = els.map((el) => cover(el, COLS, rows));
    };

    const draw = (now: number) => {
      const t = start ? Math.min(1, (now - start) / DURATION) : 1;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(full[cur], 0, 0);
      if (t < 1) {
        ctx.imageSmoothingEnabled = false;
        const tw = W / COLS;
        const th = H / rows;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < COLS; c++) {
            const k = r * COLS + c;
            const local = Math.min(1, Math.max(0, (t - rand(k) * 0.55) / 0.45));
            if (local >= 1) continue;
            const dx = Math.floor(c * tw);
            const dy = Math.floor(r * th);
            const dw = Math.ceil(tw) + 1;
            const dh = Math.ceil(th) + 1;
            if (local <= 0) {
              ctx.drawImage(full[prev], dx, dy, dw, dh, dx, dy, dw, dh);
            } else {
              const src = local < 0.5 ? low[prev] : low[cur];
              ctx.drawImage(src, c, r, 1, 1, dx, dy, dw, dh);
            }
          }
        }
        raf = requestAnimationFrame(draw);
      }
    };

    apiRef.current = {
      go: (i) => {
        if (i === cur) return;
        prev = cur;
        cur = i;
        cancelAnimationFrame(raf);
        if (reduced || !full.length) {
          start = 0;
          if (full.length) draw(0);
          return;
        }
        start = performance.now();
        raf = requestAnimationFrame(draw);
      },
    };

    let loaded = 0;
    const onLoad = () => {
      loaded++;
      build();
      draw(start ? performance.now() : 0);
    };
    els.forEach((el) => {
      if (el.complete && el.naturalWidth) onLoad();
      else el.addEventListener("load", onLoad, { once: true });
    });

    const ro = new ResizeObserver(() => {
      if (!loaded) return;
      build();
      draw(0);
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      apiRef.current = null;
    };
  }, [images]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={images[index]?.alt}
      className="block h-full w-full"
    />
  );
}
