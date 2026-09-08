import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CreditCardSummary } from "@/api/types";

interface CardTileProps {
  card: CreditCardSummary;
  /** O card escuro da tela. Um só, e no que pede atenção — não no primeiro. */
  highlight?: boolean;
  /** Editar / excluir. Ficam na última linha, ao lado da legenda do limite:
   *  antes eram posicionados por cima da barra de limite e a encobriam. */
  actions?: React.ReactNode;
}

export function CardTile({ card, highlight = false, actions }: CardTileProps) {
  const pct = card.utilizationPct ?? 0;
  const hasLimit = card.creditLimit !== null && card.creditLimit > 0;
  const high = pct >= 70;

  const hoje = new Date().getDate();
  const paraFechar = card.closingDay - hoje;
  const paraVencer = card.dueDay - hoje;

  const selo = high
    ? { texto: "Limite alto", tom: "alerta" as const }
    : paraFechar >= 0 && paraFechar <= 5
      ? { texto: paraFechar === 0 ? "Fecha hoje" : `Fecha em ${paraFechar}d`, tom: "marca" as const }
      : paraVencer >= 0 && paraVencer <= 3
        ? { texto: paraVencer === 0 ? "Vence hoje" : `Vence em ${paraVencer}d`, tom: "aviso" as const }
        : null;

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-4 rounded-[20px] p-[18px] transition-transform focus-within:-translate-y-0.5 hover:-translate-y-0.5",
        highlight ? "bg-[image:var(--spot)] shadow-[var(--shadow-lift)]" : "bg-surface shadow-[var(--shadow-soft)]",
      )}
    >
      {/* Superfície de clique esticada: o card inteiro leva à fatura sem
          aninhar botões dentro de um link. */}
      <Link
        to={`/credit-cards/${card.id}`}
        aria-label={`Abrir fatura de ${card.nickname}`}
        className="absolute inset-0 rounded-[20px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      />

      <div className="pointer-events-none relative flex items-start gap-2">
        <div className="flex min-w-0 flex-col gap-[3px]">
          <span className={cn("truncate text-[14px] font-semibold", highlight ? "text-spot-fg" : "text-text")}>
            {card.nickname}
          </span>
          <span className={cn("font-mono text-[12px]", highlight ? "text-spot-fg-2" : "text-text-4")}>
            fecha dia {card.closingDay} · vence dia {card.dueDay}
          </span>
        </div>
        {selo && (
          <span
            className={cn(
              "ml-auto flex-none whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-semibold",
              selo.tom === "alerta"
                ? highlight
                  ? "bg-white/15 text-warning"
                  : "bg-negative-tint text-negative"
                : selo.tom === "aviso"
                  ? highlight
                    ? "bg-white/15 text-warning"
                    : "bg-warning-tint text-warning"
                  : highlight
                    ? "bg-[color:var(--spot-line)] text-spot-accent"
                    : "bg-brand-tint text-brand",
            )}
          >
            {selo.texto}
          </span>
        )}
      </div>

      <div className="pointer-events-none relative flex flex-col gap-2">
        <span
          className={cn(
            "text-[10.5px] font-semibold uppercase tracking-[0.14em]",
            highlight ? "text-spot-fg-2" : "text-text-5",
          )}
        >
          Fatura atual
        </span>
        <span
          className={cn(
            "font-mono text-[30px] font-semibold leading-none -tracking-[0.03em] tabular-nums sm:text-[34px]",
            highlight ? "text-spot-fg" : "text-text",
          )}
        >
          {formatCurrency(card.currentInvoiceTotal)}
        </span>
        {hasLimit && (
          <div className={cn("mt-1 h-[5px] overflow-hidden rounded-full", highlight ? "bg-black/30" : "bg-track")}>
            <div
              className={cn("h-full rounded-full", high ? "bg-negative" : highlight ? "bg-spot-accent" : "bg-brand")}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
        )}
      </div>

      {/* Última linha: legenda à esquerda, ações à direita — em fluxo normal,
          então nada cobre nada. */}
      <div className="relative flex min-h-9 items-center gap-2">
        <span className={cn("min-w-0 truncate text-[11.5px]", highlight ? "text-spot-fg-2" : "text-text-4")}>
          {hasLimit ? `${pct}% do limite de ${formatCurrency(card.creditLimit as number)}` : "Sem limite cadastrado"}
        </span>
        {actions && <div className="ml-auto flex flex-none items-center gap-0.5">{actions}</div>}
      </div>
    </div>
  );
}
