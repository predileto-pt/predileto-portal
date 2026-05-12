import { cn } from "@/lib/utils";

export type MediaCounts = {
  image: number;
  video: number;
  panorama: number;
  ai: number;
};

export function MediaTypeBadges({
  counts,
  ariaLabel,
  className,
}: {
  counts: MediaCounts;
  ariaLabel?: string;
  className?: string;
}) {
  if (
    counts.image === 0 &&
    counts.video === 0 &&
    counts.panorama === 0 &&
    counts.ai === 0
  )
    return null;
  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      aria-label={ariaLabel}
    >
      {counts.image > 0 && (
        <MediaTypeBadge icon={<ImageIcon />} count={counts.image} />
      )}
      {counts.video > 0 && (
        <MediaTypeBadge icon={<VideoIcon />} count={counts.video} />
      )}
      {counts.panorama > 0 && (
        <MediaTypeBadge icon={<PanoramaIcon />} count={counts.panorama} />
      )}
      {counts.ai > 0 && (
        <MediaTypeBadge icon={<SparkleIcon />} count={counts.ai} tone="ai" />
      )}
    </div>
  );
}

function PanoramaIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a13.5 13.5 0 0 1 0 18" />
      <path d="M12 3a13.5 13.5 0 0 0 0 18" />
    </svg>
  );
}

function MediaTypeBadge({
  icon,
  count,
  tone = "default",
}: {
  icon: React.ReactNode;
  count: number;
  tone?: "default" | "ai";
}) {
  const toneClass =
    tone === "ai"
      ? "bg-gradient-to-r from-[hsl(172_66%_42%)] to-[hsl(38_92%_50%)] text-white"
      : "bg-black/55 text-white";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded",
        toneClass,
      )}
    >
      <span className="w-4 h-4 flex items-center justify-center" aria-hidden>
        {icon}
      </span>
      <span className="leading-none">{count}</span>
    </span>
  );
}

function ImageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden
    >
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden
    >
      <path d="M12 3v3" />
      <path d="M12 18v3" />
      <path d="M3 12h3" />
      <path d="M18 12h3" />
      <path d="m5.6 5.6 2.1 2.1" />
      <path d="m16.3 16.3 2.1 2.1" />
      <path d="m5.6 18.4 2.1-2.1" />
      <path d="m16.3 7.7 2.1-2.1" />
    </svg>
  );
}
