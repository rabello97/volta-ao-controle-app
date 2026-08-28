import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Chip({ selected = false, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-[11px] border px-3 py-1.5 text-[13px] font-medium transition-all active:scale-95",
        selected
          ? "border-brand bg-brand text-brand-ink"
          : "border-divider bg-surface text-text-2 hover:border-divider-strong hover:bg-surface-2",
        className,
      )}
      {...props}
    />
  );
}
