import { motion } from "framer-motion";
import { formatCurrency, formatMonthLabel } from "@/lib/format";
import type { MonthlyTotal } from "@/lib/monthlyEvolution";

export function MonthlyBarChart({ data }: { data: MonthlyTotal[] }) {
  const max = Math.max(1, ...data.map((d) => d.total));

  return (
    <div className="flex h-[170px] items-end gap-3.5">
      {data.map((item, index) => (
        <div key={`${item.year}-${item.month}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <span className="text-[11px] font-bold text-text">{formatCurrency(item.total)}</span>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${Math.round((item.total / max) * 130)}px` }}
            transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.03 }}
            className={index === data.length - 1 ? "w-full rounded-t-lg bg-brand" : "w-full rounded-t-lg bg-track"}
          />
          <span className="text-xs text-text-muted">{formatMonthLabel(item.month)}</span>
        </div>
      ))}
    </div>
  );
}
