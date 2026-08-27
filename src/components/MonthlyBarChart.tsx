import { motion } from "framer-motion";
import { MoneyValue } from "@/components/MoneyValue";
import { formatMonthLabel } from "@/lib/format";
import type { MonthlyTotal } from "@/lib/monthlyEvolution";

export function MonthlyBarChart({ data }: { data: MonthlyTotal[] }) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.income, d.expense)));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 text-xs text-text-3">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-positive" /> Entradas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-negative" /> Saídas
        </span>
      </div>
      <div className="flex h-[170px] items-end gap-3.5">
        {data.map((item, index) => {
          const sobra = item.income - item.expense;
          return (
            <div key={`${item.year}-${item.month}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <MoneyValue value={sobra} tone={sobra >= 0 ? "positive" : "negative"} signed className="text-[10.5px] font-medium" />
              <div className="flex h-full w-full items-end gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.round((item.income / max) * 130)}px` }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.03 }}
                  className="w-full rounded-t-md bg-positive"
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.round((item.expense / max) * 130)}px` }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.03 }}
                  className="w-full rounded-t-md bg-negative"
                />
              </div>
              <span className="text-xs text-text-3">{formatMonthLabel(item.month)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
