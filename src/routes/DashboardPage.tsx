import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, TrendingUp, TrendingDown, Wallet, Clock } from "lucide-react";
import { toast } from "sonner";
import { HouseholdViewToggle } from "@/components/HouseholdViewToggle";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { BalanceTrendChart } from "@/components/BalanceTrendChart";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { Skeleton } from "@/components/Skeleton";
import { ErrorState } from "@/components/ErrorState";
import { StatTile } from "@/components/StatTile";
import { SurfaceCard, CardLink, CardTabs } from "@/components/SurfaceCard";
import { MonthlyInsightCard } from "@/components/MonthlyInsightCard";
import { TransactionFormDialog } from "@/components/TransactionFormDialog";
import { useHouseholdView } from "@/context/HouseholdViewContext";
import { useBalanceSeries, useCategoryInsight, useDashboard } from "@/hooks/useDashboard";
import { useUpcomingDue } from "@/hooks/useUpcomingDue";
import { useBudgetStatus } from "@/hooks/useBudget";
import { useAIStatus } from "@/hooks/useAI";
import { useInstallmentPlans } from "@/hooks/useInstallments";
import { scopeFor } from "@/lib/scope";
import { plural } from "@/lib/plural";
import { WalletCards } from "@/components/WalletCards";
import { Fab } from "@/components/Fab";
import { usePayRecurringBill } from "@/hooks/useRecurringBills";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useCategorySummary } from "@/hooks/useReports";
import { useMonth, monthRange, type MonthValue } from "@/context/MonthContext";
import { formatCurrency, formatMonthLabel, splitCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TransactionFormPayload } from "@/api/transactions";
import type { UpcomingDueItem } from "@/api/types";

const PERIODS = [
  { value: "30d", label: "30d", days: 30 },
  { value: "6m", label: "6m", days: 182 },
  { value: "1a", label: "1a", days: 365 },
] as const;

/** Dias que ainda restam no mês, contando hoje. Em mês passado ou futuro o
 *  mês inteiro conta — não há "restante" a planejar. */
function diasRestantes(month: MonthValue, isCurrent: boolean, hoje = new Date()): number {
  const ultimoDia = new Date(month.year, month.month, 0).getDate();
  if (!isCurrent) return ultimoDia;
  return Math.max(1, ultimoDia - hoje.getDate() + 1);
}

function DueItem({ item, onPay, isPaying }: { item: UpcomingDueItem; onPay?: () => void; isPaying?: boolean }) {
  const due = new Date(item.dueDate);
  const barColor =
    item.status === "OVERDUE" ? "bg-negative" : item.kind === "INVOICE" ? "bg-warning" : "bg-brand";

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-divider py-[11px] first:border-t-0 first:pt-0">
      <div className="flex w-[38px] flex-none flex-col items-center gap-px">
        <span className="font-mono text-[15px] font-semibold text-text">{due.getUTCDate()}</span>
        <span className="text-[10.5px] uppercase tracking-[0.1em] text-text-5">
          {formatMonthLabel(due.getUTCMonth() + 1)}
        </span>
      </div>
      <div className={cn("h-[30px] w-px flex-none rounded-sm", barColor)} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[14px] font-medium text-text">{item.name}</span>
        <span className="truncate text-[12px] text-text-5">{item.category}</span>
      </div>
      <span className="flex-none whitespace-nowrap font-mono text-[14px] font-semibold text-text">
        {formatCurrency(item.amount)}
      </span>

      {/* No celular status e ação descem para uma faixa própria: na mesma linha
          do nome sobravam 14px para ele, e o nome é o que se lê primeiro. */}
      <div className="flex w-full items-center gap-2 pl-[50px] sm:contents">
        {item.status === "PAID" ? (
          <span className="flex-none rounded-full bg-positive-tint px-[9px] py-[3px] text-[11.5px] font-semibold text-positive sm:order-first">
            Paga
          </span>
        ) : item.status === "OVERDUE" ? (
          <span className="flex-none rounded-full bg-negative-tint px-[9px] py-[3px] text-[11.5px] font-semibold text-negative sm:order-first">
            Atrasada
          </span>
        ) : null}
        {onPay && item.status !== "PAID" && (
          <button
            type="button"
            onClick={onPay}
            disabled={isPaying}
            className="flex min-h-9 flex-none items-center whitespace-nowrap rounded-full bg-brand-tint px-3 text-[12.5px] font-semibold text-brand transition-colors hover:bg-brand-tint-2 disabled:opacity-50 sm:min-h-0 sm:py-[5px]"
          >
            {isPaying ? "…" : "Pagar"}
          </button>
        )}
      </div>
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
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["value"]>("30d");
  const [formOpen, setFormOpen] = useState(false);

  const dashboard = useDashboard(view, partnerId);
  const budget = useBudgetStatus(scope, month.key);
  const plans = useInstallmentPlans(scope);
  const balanceSeries = useBalanceSeries(PERIODS.find((p) => p.value === period)!.days, scope);
  const categoryInsight = useCategoryInsight(scope, month.key);
  const categorySummary = useCategorySummary(from, to, scope);
  const { items: upcoming, isLoading: upcomingLoading } = useUpcomingDue(scope, month.key);
  const ai = useAIStatus();
  // Sem chave de IA o card de análise não renderiza; sem saber disso aqui, a
  // grade ficaria com um buraco de 4 colunas ao lado do saldo.
  const comAnalise = ai.data?.enabled ?? false;
  const payMutation = usePayRecurringBill();
  const createMutation = useCreateTransaction();

  const balance = dashboard.data?.balance ?? 0;
  const inControl = balance >= 0;
  const overdue = upcoming.filter((i) => i.status === "OVERDUE");
  const pending = upcoming.filter((i) => i.status !== "PAID").slice(0, 5);

  const series = balanceSeries.data ?? [];
  const trendPct =
    series.length > 1 && series[0].balance !== 0
      ? Math.round(((series[series.length - 1].balance - series[0].balance) / Math.abs(series[0].balance)) * 100)
      : null;

  const [reais, centavos] = splitCurrency(balance);

  // Os quatro números do topo saem do orçamento do mês selecionado — por isso
  // acompanham o seletor, ao contrário do saldo em conta, que é vitalício.
  const sobra = budget.data?.leftFromIncome ?? 0;
  const renda = (budget.data?.income ?? 0) + (budget.data?.benefitIncome ?? 0);
  const gasto = budget.data?.spentTotal ?? 0;
  const ativos = (plans.data ?? []).filter((p) => !p.finished);
  const parcelasDoMes = ativos.reduce((soma, p) => soma + p.installmentAmount, 0);

  const dias = diasRestantes(month.value, month.isCurrent);
  const porDia = sobra > 0 ? sobra / dias : 0;

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
        subtitle={month.isCurrent ? `${month.label} · faltam ${plural(dias, "dia")} para fechar` : month.label}
        ctaLabel="Nova transação"
        onCta={() => setFormOpen(true)}
        aside={<HouseholdViewToggle />}
      />

      {dashboard.isError ? (
        <ErrorState onRetry={() => dashboard.refetch()} />
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-12">
          {/* 2x2 no celular: um tile por tela empurrava todo o resto do
              painel para baixo da dobra. */}
          <div className="grid grid-cols-2 gap-3.5 sm:col-span-2 sm:grid-cols-4 xl:col-span-12">
            <StatTile
              icon={TrendingUp}
              label="Sobra prevista"
              value={sobra}
              tone={sobra >= 0 ? "brand" : "negative"}
              delta={
                renda === 0
                  ? { label: "cadastre a renda", tone: "quiet" }
                  : sobra > 0
                    ? { label: `${formatCurrency(porDia)}/dia`, tone: "down" }
                    : { label: "no vermelho", tone: "up" }
              }
            />
            <StatTile icon={Wallet} label="Renda prevista" value={renda} tone="info"
              delta={{ label: (budget.data?.benefitIncome ?? 0) > 0 ? "salário + benefício" : "salário", tone: "quiet" }} />
            <StatTile icon={TrendingDown} label="Gasto até agora" value={gasto} tone="negative"
              delta={renda > 0 ? { label: `${Math.round((gasto / renda) * 100)}% da renda`, tone: gasto > renda ? "up" : "quiet" } : undefined} />
            <StatTile icon={Clock} label="Parcelas do mês" value={parcelasDoMes} tone="warning"
              delta={{ label: `${plural(ativos.length, "plano")} ${ativos.length === 1 ? "ativo" : "ativos"}`, tone: "quiet" }} />
          </div>

          {/* Saldo em conta + tendência. Rótulo honesto: é acumulado e não
              segue o seletor de mês, ao contrário dos quatro tiles acima. */}
          <SurfaceCard
            className={cn("sm:col-span-2", comAnalise ? "xl:col-span-8" : "xl:col-span-12")}
            title="Saldo em conta"
            action={<CardTabs options={PERIODS} value={period} onChange={setPeriod} />}
          >
            <div className="mb-3 flex flex-wrap items-baseline gap-3">
              {dashboard.isLoading ? (
                <Skeleton className="h-[34px] w-52" />
              ) : (
                <span
                  className={cn(
                    "whitespace-nowrap font-mono text-[34px] font-semibold leading-none -tracking-[0.03em] tabular-nums",
                    inControl ? "text-text" : "text-negative",
                  )}
                >
                  {reais}
                  <span className={cn("text-[20px]", inControl ? "text-text-4" : "text-negative/70")}>{centavos}</span>
                </span>
              )}
              {trendPct !== null && (
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[12px] font-semibold",
                    trendPct >= 0 ? "bg-positive-tint text-positive" : "bg-negative-tint text-negative",
                  )}
                >
                  {trendPct >= 0 ? "+" : "−"}
                  {Math.abs(trendPct)}% no período
                </span>
              )}
              <span className="ml-auto text-[11.5px] text-text-5">acumulado, não segue o mês</span>
            </div>
            <BalanceTrendChart data={series} positive={inControl} />
          </SurfaceCard>

          <MonthlyInsightCard scope={scope} month={month.key} className="sm:col-span-2 xl:col-span-4" />

          <SurfaceCard
            className="sm:col-span-2 xl:col-span-5"
            title="Vence nos próximos dias"
            action={<CardLink onClick={() => navigate("/contas")}>Ver todas</CardLink>}
          >
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

            {aPagar.length > 0 && (
              <div className="mt-auto flex flex-wrap items-baseline justify-between gap-2 border-t border-divider pt-3">
                <span className="text-[12px] text-text-4">
                  {plural(aPagar.length, "conta")} em aberto
                  {overdue.length > 0 ? ` · ${plural(overdue.length, "atrasada")}` : ""}
                </span>
                <span className="font-mono text-[15px] font-semibold text-text">{formatCurrency(totalAPagar)}</span>
              </div>
            )}
          </SurfaceCard>

          {/* Benefício é dinheiro separado do saldo da conta, de propósito. */}
          <WalletCards scope={scope} className="sm:col-span-2 xl:col-span-3" />

          <SurfaceCard
            className="sm:col-span-2 xl:col-span-4"
            title="Para onde foi"
            action={<CardLink onClick={() => navigate("/reports")}>Relatório</CardLink>}
          >
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
                  <div className="mt-auto flex items-start gap-[11px] rounded-[13px] bg-surface-inset px-3.5 py-[13px]">
                    <span className="flex size-[22px] flex-none items-center justify-center rounded-full bg-brand-tint text-xs font-bold text-brand">
                      i
                    </span>
                    <span className="text-[12.5px] leading-[1.45] text-text-3">
                      {categoryInsight.data.category} subiu {categoryInsight.data.changePct}% em relação à média dos
                      últimos 3 meses. Vale revisar antes do fim do mês.
                    </span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-text-3">Nenhum gasto registrado neste mês.</p>
            )}
          </SurfaceCard>
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
