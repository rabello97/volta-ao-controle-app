import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/Skeleton";
import { useBudgetStatus } from "@/hooks/useBudget";
import type { BudgetCategoryStatus } from "@/api/types";

function barTone(usedPct: number): string {
  if (usedPct >= 100) return "bg-negative";
  if (usedPct >= 80) return "bg-warning";
  return "bg-brand";
}

function CategoryRow({ item }: { item: BudgetCategoryStatus }) {
  const over = item.remaining < 0;
  return (
    <div className="flex flex-col gap-1.5 border-b border-divider py-3 last:border-b-0">
      <div className="flex items-center gap-2">
        <span className="flex-1 truncate text-[13px] capitalize text-text">{item.category}</span>
        <span className="flex-none font-mono text-[13px] text-text-3">
          {formatCurrency(item.spent)} / {formatCurrency(item.limit)}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-[4px] bg-track">
        <div
          className={cn("h-full rounded-[4px]", barTone(item.usedPct))}
          style={{ width: `${Math.min(100, item.usedPct)}%` }}
        />
      </div>
      <span className={cn("text-[11px]", over ? "text-negative" : "text-text-4")}>
        {over
          ? `Passou ${formatCurrency(Math.abs(item.remaining))} do teto`
          : `Sobram ${formatCurrency(item.remaining)} · ${item.usedPct}% usado`}
        {item.spentFromBenefit > 0 && ` · ${formatCurrency(item.spentFromBenefit)} pagos com benefício`}
      </span>
    </div>
  );
}

export function BudgetPanel({ scope, month }: { scope?: string; month?: string }) {
  const status = useBudgetStatus(scope, month);

  if (status.isLoading) {
    return (
      <div className="flex flex-col gap-3 rounded-[18px] border border-divider bg-surface px-[22px] py-5">
        <Skeleton className="h-4 w-40" />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  const data = status.data;
  if (!data) return null;

  const semRenda = data.income <= 0;
  const noVermelho = data.leftFromIncome < 0;

  return (
    <section className="flex flex-col gap-3 rounded-[18px] border border-divider bg-surface px-4 py-5 shadow-[var(--shadow-card)] sm:px-[22px]">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 className="text-[15px] font-semibold text-text">Orçamento do mês</h2>
        <span className="text-[12px] text-text-4">Renda contra o que já saiu</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <div className="flex flex-col gap-1 rounded-xl border border-divider bg-surface-2 px-3 py-2.5">
          <span className="text-[11px] font-semibold tracking-[0.12em] text-text-4">RENDA</span>
          <span className="font-mono text-[15px] text-text">{formatCurrency(data.income)}</span>
          {data.benefitIncome > 0 && (
            <span className="text-[11px] text-text-4">+ {formatCurrency(data.benefitIncome)} em benefícios</span>
          )}
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-divider bg-surface-2 px-3 py-2.5">
          <span className="text-[11px] font-semibold tracking-[0.12em] text-text-4">SAIU DA CONTA</span>
          <span className="font-mono text-[15px] text-text">{formatCurrency(data.spentFromAccount)}</span>
          {data.spentTotal > data.spentFromAccount && (
            <span className="text-[11px] text-text-4">
              {formatCurrency(data.spentTotal - data.spentFromAccount)} pagos com benefício
            </span>
          )}
        </div>
        <div className="col-span-2 flex flex-col gap-1 rounded-xl border border-divider bg-surface-2 px-3 py-2.5 sm:col-span-1">
          <span className="text-[11px] font-semibold tracking-[0.12em] text-text-4">SOBRA</span>
          <span className={cn("font-mono text-[15px]", noVermelho ? "text-negative" : "text-positive")}>
            {formatCurrency(data.leftFromIncome)}
          </span>
        </div>
      </div>

      {semRenda && (
        <p className="rounded-xl border border-dashed border-divider px-3 py-2.5 text-[12px] text-text-4">
          Cadastre sua renda mensal em Configurações para o app saber se o mês fecha no azul.
        </p>
      )}

      {data.categories.length > 0 ? (
        <div className="flex flex-col">
          {data.categories.map((item) => (
            <CategoryRow key={item.category} item={item} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-divider px-3 py-6 text-center text-[12px] text-text-4">
          Nenhum teto definido ainda. Configure em Configurações para acompanhar categoria por categoria.
        </p>
      )}

      {data.unbudgetedSpent > 0 && (
        <p className="text-[12px] text-text-4">
          {formatCurrency(data.unbudgetedSpent)} saíram em categorias sem teto definido.
        </p>
      )}
    </section>
  );
}
