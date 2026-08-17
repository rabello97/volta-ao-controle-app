import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/format";
import type { CategorySummaryEntry } from "@/api/types";

export function CategoryBarList({ data }: { data: CategorySummaryEntry[] }) {
  const max = Math.max(1, ...data.map((d) => d.total));

  return (
    <div className="flex flex-col gap-3.5">
      {data.map((item) => (
        <div key={item.category}>
          <div className="mb-1.5 flex justify-between text-[13px]">
            <span className="text-text">{item.category}</span>
            <span className="font-bold text-text">{formatCurrency(item.total)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-track">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((item.total / max) * 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full rounded-full bg-brand"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
