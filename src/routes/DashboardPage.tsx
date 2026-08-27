import { useState } from "react";
import { TrendingUp, TrendingDown, AlertTriangle, CalendarClock, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { HouseholdViewToggle } from "@/components/HouseholdViewToggle";
import { StatCard } from "@/components/StatCard";
import { EmptyState } from "@/components/EmptyState";
import { MoneyValue } from "@/components/MoneyValue";
import { DueRow } from "@/components/DueRow";
import { BalanceTrendChart } from "@/components/BalanceTrendChart";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { Button } from "@/components/ui/button";
import { useHouseholdView } from "@/context/HouseholdViewContext";
import { useBalanceSeries, useCategoryInsight, useDashboard } from "@/hooks/useDashboard";
import { useUpcomingDue } from "@/hooks/useUpcomingDue";
import { usePayRecurringBill } from "@/hooks/useRecurringBills";
import { useCategorySummaryThisMonth } from "@/hooks/useReports";
import { cn } from "@/lib/utils";

const PERIODS = [
  { key: "30d", label: "30d", days: 30 },
  { key: "6m", label: "6m", days: 182 },
  { key: "1a", label: "1a", days: 365 },
] as const;

export function DashboardPage() {
  const { view, partner } = useHouseholdView();
  const partnerId = partner?.id ?? null;
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["key"]>("30d");
  const dashboard = useDashboard(view, partnerId);
  const balanceSeries = useBalanceSeries(PERIODS.find((p) => p.key === period)!.days);
  const categoryInsight = useCategoryInsight();
  const categorySummary = useCategorySummaryThisMonth();
  const { items: upcoming } = useUpcomingDue();
  const payMutation = usePayRecurringBill();

  const balance = dashboard.data?.balance ?? 0;
  const inControl = balance >= 0;
  const overdue = upcoming.filter((item) => item.status === "OVERDUE");
  const pending = upcoming.filter((item) => item.status !== "PAID").slice(0, 6);

  const series = balanceSeries.data ?? [];
  const trendPct =
    series.length > 1 && series[0].balance !== 0
      ? Math.round(((series[series.length - 1].balance - series[0].balance) / Math.abs(series[0].balance)) * 100)
      : null;

  async function handlePay(recurringBillId: string) {
    try {
      await payMutation.mutateAsync(recurringBillId);
      toast.success("Conta marcada como paga.");
    } catch {
      toast.error("Não foi possível registrar o pagamento.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-[22px] font-semibold text-text">Painel</h1>
        <HouseholdViewToggle />
      </div>

      {dashboard.isError && (
        <div className="flex flex-col items-start gap-2 rounded-2xl border border-negative/20 bg-negative-tint p-4 text-sm text-negative">
          <span>Não foi possível carregar o painel.</span>
          <Button size="sm" variant="secondary" onClick={() => dashboard.refetch()}>
            <RotateCw className="size-3.5" /> Tentar novamente
          </Button>
        </div>
      )}

      {overdue.length > 0 && (
        <div className="flex flex-col gap-2">
          {overdue.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2.5 rounded-2xl border border-negative/20 bg-negative-tint px-4 py-3 text-[13px] font-medium text-negative"
            >
              <AlertTriangle className="size-4 flex-none" />
              <span className="flex-1">
                {item.name} está atrasado — <MoneyValue value={item.amount} tone="negative" className="text-[13px]" />
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12 lg:grid-rows-[repeat(2,minmax(0,auto))]">
        <div className="flex flex-col justify-between gap-5 rounded-2xl border border-divider bg-surface p-6 shadow-[var(--shadow-card)] lg:col-span-8 lg:row-span-2">
          <div className="flex items-start justify-between gap-4">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-text-4">Saldo atual</span>
            <div className="flex items-center gap-0.5 rounded-lg bg-track p-0.5">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPeriod(p.key)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors",
                    period === p.key ? "bg-surface text-text shadow-[var(--shadow-card)]" : "text-text-3 hover:text-text",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {dashboard.data ? (
              <MoneyValue value={dashboard.data.balance} tone="neutral" className="text-4xl font-semibold tracking-tight sm:text-5xl" />
            ) : (
              <span className="text-4xl text-text-4 sm:text-5xl">—</span>
            )}
            <div className="flex items-center gap-2">
              {trendPct !== null && (
                <span className={cn("text-[13px] font-medium", trendPct >= 0 ? "text-positive" : "text-negative")}>
                  {trendPct >= 0 ? "↑" : "↓"} {Math.abs(trendPct)}% vs. período anterior
                </span>
              )}
              <span className={cn("text-[13px]", inControl ? "text-text-3" : "text-negative")}>
                {inControl ? "No controle" : "Saldo negativo"}
              </span>
            </div>
          </div>

          <BalanceTrendChart data={series} positive={inControl} />
        </div>

        <div className="lg:col-span-4">
          <StatCard icon={TrendingUp} label="Entradas" value={dashboard.data?.income ?? 0} tone="positive" />
        </div>
        <div className="lg:col-span-2">
          <StatCard icon={TrendingDown} label="Saídas" value={dashboard.data?.expense ?? 0} tone="negative" />
        </div>
        <div className="lg:col-span-2">
          <StatCard icon={CalendarClock} label="Dívidas em aberto" value={dashboard.data?.debts ?? 0} tone="negative" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <div className="rounded-2xl border border-divider bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-[15px] font-semibold text-text">Próximos vencimentos</h2>
            {overdue.length > 0 && <span className="text-xs font-semibold text-negative">{overdue.length} atrasado(s)</span>}
          </div>
          {pending.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="Nenhum vencimento por aqui"
              description="Contas recorrentes e faturas de cartão aparecem aqui conforme vencem."
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {pending.map((item) => (
                <DueRow
                  key={item.id}
                  item={item}
                  onPay={item.recurringBillId ? () => handlePay(item.recurringBillId as string) : undefined}
                  isPaying={payMutation.isPending && payMutation.variables === item.recurringBillId}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-divider bg-surface p-5 shadow-[var(--shadow-card)]">
          <h2 className="mb-3 font-heading text-[15px] font-semibold text-text">Para onde foi o dinheiro</h2>
          {categorySummary.data && categorySummary.data.length > 0 ? (
            <div className="flex flex-col gap-4">
              <CategoryBreakdown data={categorySummary.data} />
              {categoryInsight.data && (
                <p className="rounded-xl bg-info-tint px-3.5 py-2.5 text-[13px] text-info">
                  {categoryInsight.data.category} subiu {categoryInsight.data.changePct}% em relação à média dos
                  últimos 3 meses.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-text-3">Nenhum gasto registrado neste mês.</p>
          )}
        </div>
      </div>
    </div>
  );
}
