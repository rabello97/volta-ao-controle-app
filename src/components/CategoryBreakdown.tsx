import { MoneyValue } from "@/components/MoneyValue";
import type { CategorySummaryEntry } from "@/api/types";

const SEGMENT_COLORS = [
  "var(--color-brand)",
  "var(--color-warning)",
  "var(--color-negative)",
  "var(--color-info)",
  "var(--color-text-4)",
];

export function CategoryBreakdown({ data }: { data: CategorySummaryEntry[] }) {
  const sorted = [...data].sort((a, b) => b.total - a.total);
  const total = sorted.reduce((sum, item) => sum + item.total, 0) || 1;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex h-2 overflow-hidden rounded-full bg-track">
        {sorted.map((item, index) => (
          <div
            key={item.category}
            style={{ width: `${(item.total / total) * 100}%`, backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length] }}
          />
        ))}
      </div>

      <ul className="flex flex-col gap-2">
        {sorted.map((item, index) => (
          <li key={item.category} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2 flex-none rounded-full"
                style={{ backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length] }}
              />
              <span className="truncate text-text-2">{item.category}</span>
            </span>
            <span className="flex flex-none items-center gap-2.5">
              <MoneyValue value={item.total} className="font-semibold" />
              <span className="w-9 text-right text-text-4">{Math.round((item.total / total) * 100)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
