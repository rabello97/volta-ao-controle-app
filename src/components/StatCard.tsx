import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
}

const TONE_CLASSES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  positive: "text-positive",
  negative: "text-negative",
  neutral: "text-text",
};

export function StatCard({ icon: Icon, label, value, tone = "neutral" }: StatCardProps) {
  return (
    <div className="relative flex h-full flex-col justify-between gap-3 overflow-hidden rounded-xl border border-divider bg-surface p-4.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-text-faint">{label}</span>
        <Icon className="size-4 text-text-faint" strokeWidth={2} />
      </div>
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("font-heading text-2xl font-extrabold tabular-nums tracking-tight", TONE_CLASSES[tone])}
      >
        {value}
      </motion.span>
    </div>
  );
}
