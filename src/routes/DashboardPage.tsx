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
import { usePayRecurringBill } from "@/hooks/useRecurringBills";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useCategorySummaryThisMonth } from "@/hooks/useReports";
import { formatCurrency, formatMonthLabel } from "@/lib/format";
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
function splitCurrency(value: number): [string, string] {
  const formatted = formatCurrency(value);
  const idx = formatted.lastIndexOf(",");
  return idx === -1 ? [formatted, ""] : [formatted.slice(0, idx), formatted.slice(idx)];
}

function StatRow({
  label,
  value,
  tint,
  color,
  icon,
  trailing,
  loading = false,
}: {
  label: string;
  value: number;
  tint: string;
  color: string;
  icon: React.ReactNode;
  trailing?: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-divider bg-surface px-[18px] py-4 shadow-[var(--shadow-card)]">
      <div className={cn("flex size-9 flex-none items-center justify-center rounded-[11px]", tint, color)}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
          {icon}
        </svg>
      </div>
      <div className="flex min-w-0 flex-col gap-[3px]">
        <span className="text-[10.5px] font-semibold tracking-[0.13em] text-text-4">{label}</span>
        {loading ? (
          <Skeleton className="h-6 w-32" />
        ) : (
          <span className="whitespace-nowrap font-mono text-xl font-medium -tracking-[0.02em] text-text">
            {formatCurrency(value)}
          </span>
        )}
      </div>
      {!loading && trailing && <span className="ml-auto flex-none whitespace-nowrap">{trailing}</span>}
    </div>
  );
}

function DueItem({ item, onPay, isPaying }: { item: UpcomingDueItem; onPay?: () => void; isPaying?: boolean }) {
  const due = new Date(item.dueDate);
  const barColor =
    item.status === "OVERDUE" ? "bg-negative" : item.kind === "INVOICE" ? "bg-warning" : "bg-brand";

  return (
    <div className="flex items-center gap-3.5 border-b border-divider py-3.5 last:border-b-0">
      <div className="flex w-[42px] flex-none flex-col items-center gap-px">
        <span className="font-mono text-base font-medium text-text">{due.getUTCDate()}</span>
        <span className="text-[10px] uppercase tracking-[0.1em] text-text-5">
          {formatMonthLabel(due.getUTCMonth() + 1)}
        </span>
      </div>
      <div className={cn("h-[30px] w-px flex-none rounded-sm", barColor)} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-[13.5px] font-medium text-text">{item.name}</span>
        <span className="truncate text-[11.5px] text-text-4">{item.category}</span>
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
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["key"]>("30d");
  const [formOpen, setFormOpen] = useState(false);

  const dashboard = useDashboard(view, partnerId);
  const balanceSeries = useBalanceSeries(PERIODS.find((p) => p.key === period)!.days);
  const categoryInsight = useCategoryInsight();
  const categorySummary = useCategorySummaryThisMonth();
  const { items: upcoming, isLoading: upcomingLoading } = useUpcomingDue();
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
  const now = new Date();

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
        subtitle={`${["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"][now.getMonth()]} de ${now.getFullYear()}`}
        ctaLabel="Nova transação"
        onCta={() => setFormOpen(true)}
        search=""
        onSearchChange={(v) => navigate(`/transactions?search=${encodeURIComponent(v)}`)}
        aside={<HouseholdViewToggle />}
      />

      {dashboard.isError ? (
        <ErrorState onRetry={() => dashboard.refetch()} />
      ) : (
      <div className="flex flex-col gap-4">

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.55fr_1fr]">
          <section className="flex flex-col overflow-hidden rounded-[18px] border border-hero-border bg-[image:var(--hero-grad)] px-5 pt-5 sm:px-[26px] sm:pt-6">
            <div className="flex flex-col-reverse items-start gap-3 sm:flex-row sm:gap-3.5">
              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-semibold tracking-[0.14em] text-text-4">SALDO ATUAL</span>
                {dashboard.isLoading ? (
                  <Skeleton className="h-[34px] w-56 sm:h-[46px] sm:w-72" />
                ) : (
                  <span className="whitespace-nowrap font-mono text-[34px] font-medium leading-none -tracking-[0.035em] text-text sm:text-[46px]">
                    {reais}
                    <span className="text-text-4">{centavos}</span>
                  </span>
                )}
                <div className="flex flex-wrap items-center gap-2.5">
                  {trendPct !== null && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold",
                        trendPct >= 0 ? "bg-brand-tint text-brand" : "bg-negative-tint text-negative",
                      )}
                    >
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                        {trendPct >= 0 ? <path d="M8 13V4M4 7.5 8 3.5l4 4" /> : <path d="M8 3v9M4 8.5 8 12.5l4-4" />}
                      </svg>
                      {Math.abs(trendPct)}% vs. período anterior
                    </span>
                  )}
                  <span className="whitespace-nowrap text-xs text-text-4">
                    {inControl ? "No controle — saldo positivo" : "Atenção — saldo negativo"}
                  </span>
                </div>
              </div>

              <div className="flex flex-none gap-1 self-end rounded-full border border-divider bg-surface-inset p-[3px] sm:ml-auto sm:self-auto">
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

            <div className="mt-[22px]">
              <BalanceTrendChart data={series} positive={inControl} />
            </div>
          </section>

          <div className="grid gap-3 lg:grid-rows-3">
            <StatRow
              loading={dashboard.isLoading}
              label="ENTRADAS"
              value={dashboard.data?.income ?? 0}
              tint="bg-brand-tint"
              color="text-brand"
              icon={<path d="M8 13V4M4 7.5 8 3.5l4 4" />}
            />
            <StatRow
              loading={dashboard.isLoading}
              label="SAÍDAS"
              value={dashboard.data?.expense ?? 0}
              tint="bg-negative-tint"
              color="text-negative"
              icon={<path d="M8 3v9M4 8.5 8 12.5l4-4" />}
            />
            <StatRow
              loading={dashboard.isLoading}
              label="DÍVIDAS EM ABERTO"
              value={dashboard.data?.debts ?? 0}
              tint="bg-warning-tint"
              color="text-warning"
              icon={
                <>
                  <rect x="2" y="3.4" width="12" height="10.2" rx="2" />
                  <path d="M2 6.6h12M5.4 2v2.4M10.6 2v2.4" />
                </>
              }
              trailing={
                <span className="text-[11.5px] text-text-4">
                  {upcoming.filter((i) => i.status !== "PAID").length} conta(s)
                </span>
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.55fr_1fr]">
          <section className="rounded-[18px] border border-divider bg-surface px-[22px] py-5 shadow-[var(--shadow-card)]">
            <div className="mb-1.5 flex items-center gap-2.5">
              <h2 className="whitespace-nowrap text-[14.5px] font-semibold text-text">Próximos vencimentos</h2>
              {dueThisWeek.length > 0 && (
                <span className="whitespace-nowrap rounded-full bg-negative-tint px-2 py-0.5 text-[10.5px] font-semibold text-negative">
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
          </section>

          <section className="flex flex-col gap-4 rounded-[18px] border border-divider bg-surface px-[22px] py-5 shadow-[var(--shadow-card)]">
            <h2 className="whitespace-nowrap text-[14.5px] font-semibold text-text">Para onde foi o dinheiro</h2>
            {categorySummary.isLoading ? (
              <div className="flex flex-col gap-3.5">
                <Skeleton className="h-2 w-full rounded-full" />
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Skeleton className="size-2 flex-none rounded-[3px]" />
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
                    <span className="flex size-[22px] flex-none items-center justify-center rounded-[7px] bg-brand-tint text-xs font-bold text-brand">
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
        </div>

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

      <TransactionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
      />
    </>
  );
}
