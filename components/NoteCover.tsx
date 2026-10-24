/* Cover for a note: its photo when one exists, otherwise a dark type card. */
export default function NoteCover({
  cover,
  title,
  category,
}: {
  cover: string | null;
  title: string;
  category: string;
}) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[4px] bg-surface">
      {cover ? (
        <img
          src={cover}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col justify-between bg-ink bg-[radial-gradient(rgba(242,241,238,0.12)_1px,transparent_1px)] p-5 text-cream [background-size:16px_16px]">
          <span className="label text-cream-muted">{category}</span>
          <span className="line-clamp-3 text-[clamp(1.35rem,2.2vw,1.9rem)] leading-[1.05] tracking-[-0.04em] transition-transform duration-700 group-hover:-translate-y-1">
            {title}
            <span className="text-accent">.</span>
          </span>
        </div>
      )}
    </div>
  );
}
