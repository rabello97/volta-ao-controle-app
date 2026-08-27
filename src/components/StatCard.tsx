import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { MoneyValue } from "@/components/MoneyValue";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  tone?: "positive" | "negative" | "neutral";
}

export function StatCard({ icon: Icon, label, value, tone = "neutral" }: StatCardProps) {
  return (
    <div className="relative flex h-full flex-col justify-between gap-3 overflow-hidden rounded-2xl border border-divider bg-surface p-4.5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-text-4">{label}</span>
        <Icon className="size-4 text-text-4" strokeWidth={1.8} />
      </div>
      <motion.div key={value} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
        <MoneyValue value={value} tone={tone} className="text-2xl font-medium tracking-tight" />
      </motion.div>
    </div>
  );
}
