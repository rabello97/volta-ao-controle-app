import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { HouseholdViewToggle } from "@/components/HouseholdViewToggle";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { BalanceTrendChart } from "@/components/BalanceTrendChart";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { Skeleton } from "@/components/Skeleton";
import { ErrorState } from "@/components/ErrorState";
import { TransactionFormDialog } from "@/components/TransactionFormDialog";
import { useHouseholdView } from "@/context/HouseholdViewContext";
import { useBalanceSeries, useCategoryInsight, useDashboard } from "@/hooks/useDashboard";
import { useUpcomingDue } from "@/hooks/useUpcomingDue";
import { scopeFor } from "@/lib/scope";
import { plural } from "@/lib/plural";
import { WalletCards } from "@/components/WalletCards";
import { MonthStatusCard } from "@/components/MonthStatusCard";
import { Fab } from "@/components/Fab";
import { usePayRecurringBill } from "@/hooks/useRecurringBills";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useCategorySummary } from "@/hooks/useReports";
import { useMonth, monthRange } from "@/context/MonthContext";
import { formatCurrency, formatMonthLabel, splitCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TransactionFormPayload } from "@/api/transactions";
import type { UpcomingDueItem } from "@/api/types";

const PERIODS = [
  { key: "30d", label: "30d", days: 30 },
  { key: "6m", label: "6m", days: 182 },
  { key: "1a", label: "1a", days: 365 },
] as const;

/** Separa o valor formatado em "R$ 8.427" + ",50" para os centavos ficarem
 *  esmaecidos, como no mockup. */

function DueItem({ item, onPay, isPaying }: { item: UpcomingDueItem; onPay?: () => void; isPaying?: boolean }) {
  const due = new Date(item.dueDate);
  const barColor =
    item.status === "OVERDUE" ? "bg-negative" : item.kind === "INVOICE" ? "bg-warning" : "bg-brand";

  return (
    <div className="flex items-center gap-3.5 border-b border-divider py-3.5 last:border-b-0">
      <div className="flex w-[42px] flex-none flex-col items-center gap-px">
        <span className="font-mono text-base font-medium text-text">{due.getUTCDate()}</span>
        <span className="text-[11px] uppercase tracking-[0.1em] text-text-5">
          {formatMonthLabel(due.getUTCMonth() + 1)}
        </span>
      </div>
      <div className={cn("h-[30px] w-px flex-none rounded-sm", barColor)} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-[13px] font-medium text-text">{item.name}</span>
        <span className="truncate text-[12px] text-text-4">{item.category}</span>
      </div>
      <span className="ml-auto flex-none whitespace-nowrap font-mono text-sm text-text">
        {formatCurrency(item.amount)}
      </span>
      {item.status === "PAID" ? (
        <span className="flex-none rounded-lg bg-brand-tint px-2.5 py-1 text-[11px] text-brand">Pago</span>
      ) : onPay ? (
        <button
          type="button"
          onClick={onPay}
          disabled={isPaying}
          className="flex-none whitespace-nowrap rounded-lg border border-divider-strong px-2.5 py-1 text-[11px] text-text-3 transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
        >
          {isPaying ? "…" : "Pagar"}
        </button>
      ) : (
        <span className="flex-none rounded-lg border border-divider-strong px-2.5 py-1 text-[11px] text-text-4">
          A pagar
        </span>
      )}
    </div>
  );
}

export function DashboardPage() {
  const { view, partner } = useHouseholdView();
  const navigate = useNavigate();
  const partnerId = partner?.id ?? null;
  const scope = scopeFor(view, partnerId);
  const month = useMonth();
  const { from, to } = monthRange(month.value);
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["key"]>("30d");
  const [formOpen, setFormOpen] = useState(false);

  const dashboard = useDashboard(view, partnerId);
  const balanceSeries = useBalanceSeries(PERIODS.find((p) => p.key === period)!.days, scope);
  const categoryInsight = useCategoryInsight(scope, month.key);
  const categorySummary = useCategorySummary(from, to, scope);
  const { items: upcoming, isLoading: upcomingLoading } = useUpcomingDue(scope, month.key);
  const payMutation = usePayRecurringBill();
  const createMutation = useCreateTransaction();

  const balance = dashboard.data?.balance ?? 0;
  const inControl = balance >= 0;
  const overdue = upcoming.filter((i) => i.status === "OVERDUE");
  const dueThisWeek = upcoming.filter((i) => {
    if (i.status === "PAID") return false;
    const days = (new Date(i.dueDate).getTime() - Date.now()) / 86_400_000;
    return days >= 0 && days <= 7;
  });
  const pending = upcoming.filter((i) => i.status !== "PAID").slice(0, 4);

  const series = balanceSeries.data ?? [];
  const trendPct =
    series.length > 1 && series[0].balance !== 0
      ? Math.round(((series[series.length - 1].balance - series[0].balance) / Math.abs(series[0].balance)) * 100)
      : null;

  const [reais, centavos] = splitCurrency(balance);

  // Dívidas em aberto do mês selecionado, derivadas dos próprios vencimentos —
  // assim o número acompanha o seletor, ao contrário do total vitalício antigo.
  const aPagar = upcoming.filter((i) => i.status !== "PAID");
  const totalAPagar = aPagar.reduce((soma, i) => soma + i.amount, 0);

  async function handlePay(id: string) {
    try {
      await payMutation.mutateAsync(id);
      toast.success("Conta marcada como paga.");
    } catch {
      toast.error("Não foi possível registrar o pagamento.");
    }
  }

  async function handleCreate(input: TransactionFormPayload) {
    try {
      await createMutation.mutateAsync({ ...input, creditCardId: input.creditCardId ?? undefined });
      setFormOpen(false);
    } catch {
      toast.error("Não foi possível salvar a transação.");
    }
  }

  return (
    <>
      <PageHeader
        title="Painel"
        subtitle={month.isCurrent ? `${month.label} · mês atual` : month.label}
        ctaLabel="Nova transação"
        onCta={() => setFormOpen(true)}
        aside={<HouseholdViewToggle />}
      />

      {dashboard.isError ? (
        <ErrorState onRetry={() => dashboard.refetch()} />
      ) : (
      <div className="flex flex-col gap-4">

        {/* A pergunta que faz a pessoa abrir o app é "posso gastar?". Saldo
            acumulado não responde isso; sobra do mês, sim. */}
        <MonthStatusCard
          scope={scope}
          monthKey={month.key}
          month={month.value}
          isCurrent={month.isCurrent}
          onCadastrarRenda={() => navigate("/settings")}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.55fr_1fr]">
          <section className="rounded-[18px] border border-divider bg-surface px-[22px] py-5 shadow-[var(--shadow-card)]">
            <div className="mb-1.5 flex items-center gap-2.5">
              <h2 className="whitespace-nowrap text-[15px] font-semibold text-text">Próximos vencimentos</h2>
              {dueThisWeek.length > 0 && (
                <span className="whitespace-nowrap rounded-full bg-negative-tint px-2 py-0.5 text-[11px] font-semibold text-negative">
                  {dueThisWeek.length} nesta semana
                </span>
              )}
            </div>
            {upcomingLoading ? (
              <div className="flex flex-col gap-4 py-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3.5">
                    <Skeleton className="size-10 flex-none rounded-lg" />
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Skeleton className="h-3.5 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : pending.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="Nenhum vencimento por aqui"
                description="Contas recorrentes e faturas de cartão aparecem aqui conforme vencem."
              />
            ) : (
              <div className="flex flex-col">
                {pending.map((item) => (
                  <DueItem
                    key={item.id}
                    item={item}
                    onPay={item.recurringBillId ? () => handlePay(item.recurringBillId as string) : undefined}
                    isPaying={payMutation.isPending && payMutation.variables === item.recurringBillId}
                  />
                ))}
              </div>
            )}

            {/* "Dívidas em aberto" morava num tile solto no topo. Aqui, ao lado
                dos botões "Pagar", ela vira informação acionável. */}
            {aPagar.length > 0 && (
              <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 border-t border-divider pt-3">
                <span className="text-[12px] text-text-4">
                  {plural(aPagar.length, "conta")} em aberto{overdue.length > 0 ? ` · ${plural(overdue.length, "atrasada")}` : ""}
                </span>
                <span className="font-mono text-[15px] text-text">{formatCurrency(totalAPagar)}</span>
              </div>
            )}
          </section>

          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-3 rounded-[18px] border border-divider bg-surface px-[22px] py-5 shadow-[var(--shadow-card)]">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                {/* Rótulo honesto: este número é vitalício e não segue o
                    seletor de mês, ao contrário do resto da tela. */}
                <span className="text-[11px] font-semibold tracking-[0.14em] text-text-4">SALDO EM CONTA</span>
                <span className="text-[11px] text-text-5">acumulado</span>
              </div>

              {dashboard.isLoading ? (
                <Skeleton className="h-[23px] w-40" />
              ) : (
                <span
                  className={cn(
                    "whitespace-nowrap font-mono text-[23px] font-medium leading-none -tracking-[0.02em]",
                    inControl ? "text-text" : "text-negative",
                  )}
                >
                  {reais}
                  <span className={inControl ? "text-text-4" : "text-negative/70"}>{centavos}</span>
                </span>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {trendPct !== null && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold",
                      trendPct >= 0 ? "bg-brand-tint text-brand" : "bg-negative-tint text-negative",
                    )}
                  >
                    {trendPct >= 0 ? "+" : "−"}
                    {Math.abs(trendPct)}%
                  </span>
                )}
                <div className="ml-auto flex flex-none gap-1 rounded-full border border-divider bg-surface-inset p-[3px]">
                  {PERIODS.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setPeriod(p.key)}
                      className={cn(
                        "rounded-full px-[11px] py-1 text-[11px] transition-colors",
                        period === p.key ? "bg-track text-text" : "text-text-5 hover:text-text",
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <BalanceTrendChart data={series} positive={inControl} />
            </section>

            {/* Benefício é dinheiro separado do saldo da conta, de propósito. */}
            <WalletCards scope={scope} />
          </div>
        </div>

        <section className="flex flex-col gap-4 rounded-[18px] border border-divider bg-surface px-[22px] py-5 shadow-[var(--shadow-card)]">
            <h2 className="whitespace-nowrap text-[15px] font-semibold text-text">Para onde foi o dinheiro</h2>
            {categorySummary.isLoading ? (
              <div className="flex flex-col gap-3.5">
                <Skeleton className="h-2 w-full rounded-full" />
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Skeleton className="size-2 flex-none rounded-[4px]" />
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="ml-auto h-3.5 w-20" />
                  </div>
                ))}
              </div>
            ) : categorySummary.data && categorySummary.data.length > 0 ? (
              <>
                <CategoryBreakdown data={categorySummary.data} />
                {categoryInsight.data && (
                  <div className="mt-auto flex items-start gap-[11px] rounded-xl border border-divider bg-surface-2 px-3.5 py-[13px]">
                    <span className="flex size-[22px] flex-none items-center justify-center rounded-[10px] bg-brand-tint text-xs font-bold text-brand">
                      i
                    </span>
                    <span className="text-xs leading-[1.45] text-text-3">
                      {categoryInsight.data.category} subiu {categoryInsight.data.changePct}% em relação à média dos
                      últimos 3 meses. Vale revisar antes do fim do mês.
                    </span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-text-3">Nenhum gasto registrado neste mês.</p>
            )}
        </section>

        {overdue.length > 0 && (
          <div className="flex flex-col gap-2">
            {overdue.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2.5 rounded-2xl border border-negative/20 bg-negative-tint px-4 py-3 text-[13px] font-medium text-negative"
              >
                {item.name} está atrasado — {formatCurrency(item.amount)}
              </div>
            ))}
          </div>
        )}
      </div>

      )}

      <Fab label="Nova transação" onClick={() => setFormOpen(true)} />

      <TransactionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
      />
    </>
  );
}
