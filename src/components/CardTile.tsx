import { Link } from "react-router-dom";
import { MoneyValue } from "@/components/MoneyValue";
import { StatusPill } from "@/components/StatusPill";
import { cn } from "@/lib/utils";
import type { CreditCardSummary } from "@/api/types";

export function CardTile({ card }: { card: CreditCardSummary }) {
  const hasLimit = card.creditLimit !== null && card.creditLimit > 0;
  const pct = card.utilizationPct ?? 0;
  const alertTone = pct >= 90 ? "negative" : pct >= 70 ? "warning" : null;

  return (
    <Link
      to={`/credit-cards/${card.id}`}
      className="flex flex-col gap-3 rounded-2xl border border-divider bg-surface p-5 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-heading text-[15px] font-bold text-text">{card.nickname}</span>
        {alertTone && <StatusPill label={alertTone === "negative" ? "Limite alto" : "Atenção"} tone={alertTone} />}
      </div>

      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-text-4">Fatura atual</span>
        <div>
          <MoneyValue value={card.currentInvoiceTotal} tone="neutral" className="text-2xl font-semibold" />
        </div>
      </div>

      {hasLimit && (
        <div className="flex flex-col gap-1.5">
          <div className="h-1.5 overflow-hidden rounded-full bg-track">
            <div
              className={cn("h-full rounded-full", alertTone === "negative" ? "bg-negative" : "bg-brand")}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <span className="text-xs text-text-4">
            {pct}% do limite de <MoneyValue value={card.creditLimit as number} className="text-xs" />
          </span>
        </div>
      )}

      <span className="text-xs text-text-4">
        Fecha dia {card.closingDay} · vence dia {card.dueDay}
      </span>
    </Link>
  );
}
