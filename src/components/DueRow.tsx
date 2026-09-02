import { Button } from "@/components/ui/button";
import { MoneyValue } from "@/components/MoneyValue";
import { StatusPill } from "@/components/StatusPill";
import { formatMonthLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { UpcomingDueItem } from "@/api/types";

interface DueRowProps {
  item: UpcomingDueItem;
  onPay?: () => void;
  isPaying?: boolean;
}

export function DueRow({ item, onPay, isPaying }: DueRowProps) {
  const dueDate = new Date(item.dueDate);
  const canPay = item.kind === "RECURRING_BILL" && item.status !== "PAID" && onPay;

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "flex size-10 flex-none flex-col items-center justify-center rounded-lg text-[11px] font-semibold leading-none",
            item.status === "OVERDUE" ? "bg-negative-tint text-negative" : "bg-track text-text-3",
          )}
        >
          <span className="font-mono text-[13px] font-bold leading-tight">{dueDate.getUTCDate()}</span>
          <span className="uppercase">{formatMonthLabel(dueDate.getUTCMonth() + 1)}</span>
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-text">{item.name}</div>
          <div className="truncate text-xs text-text-3">{item.category}</div>
        </div>
      </div>
      <div className="flex flex-none items-center gap-2.5">
        <MoneyValue value={item.amount} tone="negative" className="text-sm font-semibold" />
        {item.status === "PAID" ? (
          <StatusPill label="Pago" tone="positive" />
        ) : canPay ? (
          <Button size="sm" variant="secondary" onClick={onPay} disabled={isPaying}>
            {isPaying ? "Pagando…" : "Pagar"}
          </Button>
        ) : (
          <StatusPill label={item.status === "OVERDUE" ? "Atrasado" : "A pagar"} tone={item.status === "OVERDUE" ? "negative" : "neutral"} />
        )}
      </div>
    </li>
  );
}
