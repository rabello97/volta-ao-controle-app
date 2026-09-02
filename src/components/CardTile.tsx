import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CreditCardSummary } from "@/api/types";

/** Tile de cartão do mockup: o primeiro (ou o de menor uso) ganha o fundo em
 *  gradiente teal; os demais ficam na superfície neutra. */
export function CardTile({ card, highlight = false }: { card: CreditCardSummary; highlight?: boolean }) {
  const pct = card.utilizationPct ?? 0;
  const hasLimit = card.creditLimit !== null && card.creditLimit > 0;
  const high = pct >= 70;

  const today = new Date();
  const daysToClose = card.closingDay - today.getDate();

  return (
    <Link
      to={`/credit-cards/${card.id}`}
      className={cn(
        "flex flex-col gap-[26px] rounded-[18px] border p-5 transition-all hover:-translate-y-0.5 active:scale-[0.98]",
        highlight
          ? "border-hero-border bg-[image:var(--card-grad)]"
          : "border-divider bg-surface shadow-[var(--shadow-card)]",
      )}
    >
      <div className="flex items-start">
        <div className="flex flex-col gap-[3px]">
          <span className="text-[13px] font-semibold text-text">{card.nickname}</span>
          <span className="font-mono text-[12px] text-text-4">
            fecha dia {card.closingDay} · vence dia {card.dueDay}
          </span>
        </div>
        {high ? (
          <span className="ml-auto flex-none rounded-full bg-negative-tint px-2.5 py-[3px] text-[11px] font-semibold text-negative">
            Limite alto
          </span>
        ) : daysToClose >= 0 && daysToClose <= 5 ? (
          <span className="ml-auto flex-none rounded-full bg-brand-tint px-2.5 py-[3px] text-[11px] font-semibold text-brand">
            Fecha em {daysToClose}d
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold tracking-[0.13em] text-text-4">FATURA ATUAL</span>
        <span className="font-mono text-[34px] font-medium -tracking-[0.03em] text-text">
          {formatCurrency(card.currentInvoiceTotal)}
        </span>
        {hasLimit && (
          <>
            <div className="h-[5px] overflow-hidden rounded-[4px] bg-track">
              <div
                className={cn(
                  "h-full rounded-[4px]",
                  high ? "bg-[image:var(--meter-grad-negative)]" : "bg-[image:var(--meter-grad)]",
                )}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
            <span className="text-[11px] text-text-4">
              {pct}% do limite de {formatCurrency(card.creditLimit as number)}
            </span>
          </>
        )}
      </div>
    </Link>
  );
}
