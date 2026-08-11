import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
}

const TONE_CLASSES: Record<NonNullable<StatCardProps["tone"]>, { icon: string; wrap: string }> = {
  positive: { icon: "text-positive", wrap: "bg-positive-tint" },
  negative: { icon: "text-negative", wrap: "bg-negative-tint" },
  neutral: { icon: "text-accent", wrap: "bg-accent-tint" },
};

export function StatCard({ icon: Icon, label, value, tone = "neutral" }: StatCardProps) {
  const toneClasses = TONE_CLASSES[tone];

  return (
    <motion.div
      layout
      className="flex flex-col gap-1.5 rounded-2xl bg-surface p-4.5 shadow-sm"
    >
      <div className={cn("flex size-7 items-center justify-center rounded-lg", toneClasses.wrap)}>
        <Icon className={cn("size-4", toneClasses.icon)} />
      </div>
      <span className="text-[13px] text-text-muted">{label}</span>
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("font-heading text-xl font-extrabold", toneClasses.icon)}
      >
        {value}
      </motion.span>
    </motion.div>
  );
}
