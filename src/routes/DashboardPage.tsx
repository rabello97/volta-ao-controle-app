import { Wallet, TrendingUp, TrendingDown, AlertTriangle, CalendarClock, RotateCw } from "lucide-react";
import { HouseholdViewToggle } from "@/components/HouseholdViewToggle";
import { StatCard } from "@/components/StatCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { useHouseholdView } from "@/context/HouseholdViewContext";
import { useDashboard } from "@/hooks/useDashboard";
import { useUpcomingDue } from "@/hooks/useUpcomingDue";
import { filterDueSoon } from "@/lib/upcomingDue";
import { formatCurrency, formatDate } from "@/lib/format";

export function DashboardPage() {
  const { view, partner } = useHouseholdView();
  const partnerId = partner?.id ?? null;
  const dashboard = useDashboard(view, partnerId);
  const { items: upcoming, isLoading: upcomingLoading } = useUpcomingDue();
  const alerts = filterDueSoon(upcoming);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-[22px] font-bold text-text">Dashboard</h1>
        <HouseholdViewToggle />
      </div>

      {dashboard.isError && (
        <div className="flex flex-col items-start gap-2 rounded-2xl bg-negative-tint p-4 text-sm text-negative">
          <span>Não foi possível carregar o dashboard.</span>
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
              className="flex items-center gap-2.5 rounded-xl bg-negative-tint px-4 py-3 text-[13px] font-medium text-negative"
            >
              <AlertTriangle className="size-4 flex-none" />
              <span className="flex-1">
                {alert.name} vence em {formatDate(alert.dueDate)} — {formatCurrency(alert.amount)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Saldo"
          value={dashboard.data ? formatCurrency(dashboard.data.balance) : "—"}
          tone={dashboard.data && dashboard.data.balance < 0 ? "negative" : "positive"}
        />
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

      <div className="rounded-2xl bg-surface p-5 shadow-sm">
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
              <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-track px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-[10px] bg-surface text-sm font-bold text-text">
                    {item.dueDate.getDate()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text">{item.name}</div>
                    <div className="text-xs text-text-muted">{formatDate(item.dueDate)}</div>
                  </div>
                </div>
                <span className="text-sm font-bold text-negative">{formatCurrency(item.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
