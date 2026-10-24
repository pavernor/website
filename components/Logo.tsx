/* Pavernor diamond mark + wordmark (brand carried over from v1, recolored). */
export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <rect x="4.2" y="4.2" width="11.6" height="11.6" transform="rotate(45 10 10)" />
      <rect
        x="8"
        y="8"
        width="4"
        height="4"
        transform="rotate(45 10 10)"
        className="fill-accent"
      />
    </svg>
  );
}

export default function Logo() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-medium tracking-[-0.03em]">
      <Mark className="size-[18px]" />
      Pavernor
    </span>
  );
}
