import { TrendingUp, TrendingDown, AlertTriangle, CalendarClock, RotateCw, Gauge } from "lucide-react";
import { HouseholdViewToggle } from "@/components/HouseholdViewToggle";
import { StatCard } from "@/components/StatCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { useHouseholdView } from "@/context/HouseholdViewContext";
import { useDashboard } from "@/hooks/useDashboard";
import { useUpcomingDue } from "@/hooks/useUpcomingDue";
import { filterDueSoon } from "@/lib/upcomingDue";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function DashboardPage() {
  const { view, partner } = useHouseholdView();
  const partnerId = partner?.id ?? null;
  const dashboard = useDashboard(view, partnerId);
  const { items: upcoming, isLoading: upcomingLoading } = useUpcomingDue();
  const alerts = filterDueSoon(upcoming);
  const balance = dashboard.data?.balance ?? 0;
  const inControl = balance >= 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-[22px] font-bold tracking-tight text-text">Painel</h1>
        <HouseholdViewToggle />
      </div>

      {dashboard.isError && (
        <div className="flex flex-col items-start gap-2 rounded-xl border border-negative/20 bg-negative-tint p-4 text-sm text-negative">
          <span>Não foi possível carregar o painel.</span>
          <Button size="sm" variant="secondary" onClick={() => dashboard.refetch()}>
            <RotateCw className="size-3.5" /> Tentar novamente
          </Button>
        </div>
      )}

      {alerts.length > 0 && (
        <div className="flex flex-col gap-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center gap-2.5 rounded-xl border border-negative/20 bg-negative-tint px-4 py-3 text-[13px] font-medium text-negative"
            >
              <AlertTriangle className="size-4 flex-none" />
              <span className="flex-1">
                {alert.name} vence em {formatDate(alert.dueDate)} — {formatCurrency(alert.amount)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Leitura principal — como o mostrador central de um painel */}
      <div className="relative overflow-hidden rounded-2xl border border-divider bg-sidebar p-6">
        <div
          className={cn(
            "pointer-events-none absolute -right-16 -top-16 size-56 rounded-full blur-3xl",
            inControl ? "bg-positive/10" : "bg-negative/10",
          )}
        />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-faint">
              <Gauge className="size-3.5" /> Saldo atual
            </span>
            <span
              className={cn(
                "font-mono text-4xl font-bold tabular-nums tracking-tight sm:text-5xl",
                inControl ? "text-positive" : "text-negative",
              )}
            >
              {dashboard.data ? formatCurrency(dashboard.data.balance) : "—"}
            </span>
            <span className="text-[13px] text-text-muted">
              {dashboard.data
                ? inControl
                  ? "No controle — saldo positivo."
                  : "Atenção — saldo negativo no período."
                : "Calculando…"}
            </span>
          </div>
          <div
            className={cn(
              "hidden size-16 flex-none items-center justify-center rounded-full border sm:flex",
              inControl ? "border-positive/30 bg-positive-tint" : "border-negative/30 bg-negative-tint",
            )}
          >
            <Gauge className={cn("size-7", inControl ? "text-positive" : "text-negative")} strokeWidth={2} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-3">
        <StatCard
          icon={TrendingUp}
          label="Entradas"
          value={dashboard.data ? formatCurrency(dashboard.data.income) : "—"}
          tone="positive"
        />
        <StatCard
          icon={TrendingDown}
          label="Saídas"
          value={dashboard.data ? formatCurrency(dashboard.data.expense) : "—"}
          tone="negative"
        />
        <StatCard
          icon={CalendarClock}
          label="Dívidas em aberto"
          value={dashboard.data ? formatCurrency(dashboard.data.debts) : "—"}
          tone="negative"
        />
      </div>

      <div className="rounded-xl border border-divider bg-surface p-5">
        <h2 className="mb-3 font-heading text-[15px] font-bold text-text">Próximos vencimentos</h2>
        {!upcomingLoading && upcoming.length === 0 && (
          <EmptyState
            icon={CalendarClock}
            title="Nenhum vencimento por aqui"
            description="Contas recorrentes e faturas de cartão aparecem aqui conforme vencem."
          />
        )}
        {upcoming.length > 0 && (
          <ul className="flex flex-col gap-2.5">
            {upcoming.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-divider bg-surface-2 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-track font-mono text-sm font-bold text-text">
                    {item.dueDate.getUTCDate()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text">{item.name}</div>
                    <div className="text-xs text-text-muted">{formatDate(item.dueDate)}</div>
                  </div>
                </div>
                <span className="font-mono text-sm font-bold tabular-nums text-negative">
                  {formatCurrency(item.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
