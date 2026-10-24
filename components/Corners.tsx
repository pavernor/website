/* Mono corner markers that frame a pinned "screen" (Anveril pattern). */
export default function Corners({
  tl,
  tr,
  bl,
  br,
}: {
  tl?: string;
  tr?: string;
  bl?: string;
  br?: string;
}) {
  const cls = "absolute label text-muted";
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden sm:block">
      {tl && <span className={`${cls} left-7 top-6`}>{tl}</span>}
      {tr && <span className={`${cls} right-7 top-6`}>{tr}</span>}
      {bl && <span className={`${cls} bottom-6 left-7`}>{bl}</span>}
      {br && <span className={`${cls} bottom-6 right-7`}>{br}</span>}
    </div>
  );
}
