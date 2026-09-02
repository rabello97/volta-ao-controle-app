import { MonthlyBarChart } from "@/components/MonthlyBarChart";
import { PageHeader } from "@/components/PageHeader";
import { CategoryBarList } from "@/components/CategoryBarList";
import { MoneyValue } from "@/components/MoneyValue";
import { useHouseholdView } from "@/context/HouseholdViewContext";
import {
  useCategorySummary,
  useHouseholdDashboard,
  useMonthlyEvolution,
  usePartnerDashboard,
  useProjection,
  useSelfDashboard,
} from "@/hooks/useReports";
import { buildComparisonRows } from "@/lib/comparisonTable";
import { formatMonthLabel } from "@/lib/format";
import { BudgetPanel } from "@/components/BudgetPanel";
import { MonthlyInsightCard } from "@/components/MonthlyInsightCard";
import { HouseholdViewToggle } from "@/components/HouseholdViewToggle";
import { scopeFor } from "@/lib/scope";
import { useMonth, monthRange } from "@/context/MonthContext";

export function ReportsPage() {
  const { view, partner, hasHousehold } = useHouseholdView();
  const scope = scopeFor(view, partner?.id ?? null);
  const month = useMonth();
  const { from, to } = monthRange(month.value);
  const evolution = useMonthlyEvolution(6, scope);
  const categorySummary = useCategorySummary(from, to, scope);
  const projection = useProjection();

  const selfDashboard = useSelfDashboard();
  const partnerDashboard = usePartnerDashboard(hasHousehold ? (partner?.id ?? null) : null);
  const householdDashboard = useHouseholdDashboard(hasHousehold);

  const comparisonRows =
    hasHousehold && selfDashboard.data && partnerDashboard.data && householdDashboard.data
      ? buildComparisonRows(selfDashboard.data, partnerDashboard.data, householdDashboard.data)
      : null;

  const lastProjection = projection.data?.[projection.data.length - 1];

  return (
    <>
      <PageHeader title="Relatórios" subtitle="Últimos 6 meses" aside={<HouseholdViewToggle />} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <MonthlyInsightCard scope={scope} month={month.key} />
        </div>
        <div className="lg:col-span-2">
          <BudgetPanel scope={scope} month={month.key} />
        </div>
        <div className="rounded-[18px] border border-divider bg-surface px-[22px] py-5 shadow-[var(--shadow-card)] lg:col-span-2">
          <h2 className="mb-4 text-[15px] font-semibold text-text">Entradas e saídas — últimos 6 meses</h2>
          {evolution.data && <MonthlyBarChart data={evolution.data} />}
        </div>

        <div className="rounded-[18px] border border-divider bg-surface px-[22px] py-5 shadow-[var(--shadow-card)]">
          <h2 className="mb-4 text-[15px] font-semibold text-text">Gastos por categoria (mês atual)</h2>
          {categorySummary.data && categorySummary.data.length > 0 ? (
            <CategoryBarList data={categorySummary.data} />
          ) : (
            <p className="text-sm text-text-3">Nenhum gasto registrado neste mês.</p>
          )}
        </div>

        <div className="rounded-[18px] border border-divider bg-surface px-[22px] py-5 shadow-[var(--shadow-card)]">
          <h2 className="mb-4 text-[15px] font-semibold text-text">Projeção de saldo</h2>
          <div className="flex flex-col gap-2.5 text-sm text-text">
            <div className="flex justify-between">
              <span>Saldo atual</span>
              {selfDashboard.data ? <MoneyValue value={selfDashboard.data.balance} className="font-semibold" /> : "—"}
            </div>
            <div className="flex justify-between">
              <span>Dívidas em aberto</span>
              {selfDashboard.data ? (
                <MoneyValue value={-selfDashboard.data.debts} tone="negative" className="font-semibold" />
              ) : (
                "—"
              )}
            </div>
            <div className="my-1 h-px bg-divider" />
            <div className="flex justify-between text-base">
              <span>
                Projeção {lastProjection ? `${formatMonthLabel(lastProjection.month)}/${lastProjection.year}` : ""}
              </span>
              {lastProjection ? (
                <MoneyValue
                  value={lastProjection.projectedBalance}
                  tone={lastProjection.projectedBalance < 0 ? "negative" : "positive"}
                  className="text-base font-semibold"
                />
              ) : (
                "—"
              )}
            </div>
          </div>
        </div>

        {hasHousehold && (
          <div className="rounded-[18px] border border-divider bg-surface px-[22px] py-5 shadow-[var(--shadow-card)] lg:col-span-2">
            <h2 className="mb-4 text-[15px] font-semibold text-text">Individual vs. unificado</h2>
            {comparisonRows ? (
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-left text-text-3">
                    <th className="py-2 font-medium" />
                    <th className="py-2 font-medium">Você</th>
                    <th className="py-2 font-medium">{partner?.name ?? "Parceiro(a)"}</th>
                    <th className="py-2 font-medium">Unificado</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.label} className="border-t border-divider">
                      <td className="py-2 font-semibold text-text">{row.label}</td>
                      <td className="py-2">
                        <MoneyValue value={row.self} />
                      </td>
                      <td className="py-2">
                        <MoneyValue value={row.partner} />
                      </td>
                      <td className="py-2">
                        <MoneyValue value={row.household} className="font-semibold" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-text-3">Carregando comparação…</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
