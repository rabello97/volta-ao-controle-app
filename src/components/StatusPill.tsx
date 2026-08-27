import { cn } from "@/lib/utils";

export type StatusTone = "positive" | "negative" | "warning" | "neutral";

interface StatusPillProps {
  label: string;
  tone: StatusTone;
  className?: string;
}

const TONE_CLASSES: Record<StatusTone, string> = {
  positive: "bg-positive-tint text-positive",
  negative: "bg-negative-tint text-negative",
  warning: "bg-warning-tint text-warning",
  neutral: "bg-track text-text-3",
};

export function StatusPill({ label, tone, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
