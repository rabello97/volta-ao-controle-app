import { formatCurrency } from "@/lib/format";
import type { CategorySummaryEntry } from "@/api/types";

/** Ordem de cores das categorias, igual à do mockup (teal, âmbar, coral, azul,
 *  cinza para "Outros"). */
const SEGMENT_COLORS = [
  "var(--cat-1)",
  "var(--cat-2)",
  "var(--cat-3)",
  "var(--cat-4)",
  "var(--cat-5)",
];

export function CategoryBreakdown({ data }: { data: CategorySummaryEntry[] }) {
  const sorted = [...data].sort((a, b) => b.total - a.total);
  const top = sorted.slice(0, 4);
  const rest = sorted.slice(4);
  const outros = rest.reduce((sum, item) => sum + item.total, 0);
  const rows = outros > 0 ? [...top, { category: "Outros", total: outros }] : top;
  const total = rows.reduce((sum, item) => sum + item.total, 0) || 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-[3px]">
        {rows.map((item, index) => (
          <div
            key={item.category}
            className="h-2 rounded-[4px]"
            style={{ flex: item.total, background: SEGMENT_COLORS[index] }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-[13px]">
        {rows.map((item, index) => (
          <div key={item.category} className="flex items-center gap-2.5">
            <span
              className="size-2 flex-none rounded-[4px]"
              style={{ background: SEGMENT_COLORS[index] }}
            />
            <span className="truncate text-[13px] capitalize text-text">{item.category}</span>
            <span className="ml-auto flex-none whitespace-nowrap font-mono text-[13px] text-text-2">
              {formatCurrency(item.total)}
            </span>
            <span className="w-[34px] flex-none text-right font-mono text-xs text-text-5">
              {Math.round((item.total / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
