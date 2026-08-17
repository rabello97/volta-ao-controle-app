import { MonthlyBarChart } from "@/components/MonthlyBarChart";
import { CategoryBarList } from "@/components/CategoryBarList";
import { useHouseholdView } from "@/context/HouseholdViewContext";
import {
  useCategorySummaryThisMonth,
  useHouseholdDashboard,
  useMonthlyEvolution,
  usePartnerDashboard,
  useProjection,
  useSelfDashboard,
} from "@/hooks/useReports";
import { buildComparisonRows } from "@/lib/comparisonTable";
import { formatCurrency, formatMonthLabel } from "@/lib/format";

export function ReportsPage() {
  const { partner, hasHousehold } = useHouseholdView();
  const evolution = useMonthlyEvolution();
  const categorySummary = useCategorySummaryThisMonth();
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
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-[22px] font-bold text-text">Relatórios</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-divider bg-surface p-5 lg:col-span-2">
          <h2 className="mb-4 font-heading text-[15px] font-bold text-text">Evolução de gastos — últimos 6 meses</h2>
          {evolution.data && <MonthlyBarChart data={evolution.data} />}
        </div>

        <div className="rounded-xl border border-divider bg-surface p-5">
          <h2 className="mb-4 font-heading text-[15px] font-bold text-text">Gastos por categoria (mês atual)</h2>
          {categorySummary.data && categorySummary.data.length > 0 ? (
            <CategoryBarList data={categorySummary.data} />
          ) : (
            <p className="text-sm text-text-muted">Nenhum gasto registrado neste mês.</p>
          )}
        </div>

        <div className="rounded-xl border border-divider bg-surface p-5">
          <h2 className="mb-4 font-heading text-[15px] font-bold text-text">Projeção de saldo</h2>
          <div className="flex flex-col gap-2.5 text-sm text-text">
            <div className="flex justify-between">
              <span>Saldo atual</span>
              <strong>{selfDashboard.data ? formatCurrency(selfDashboard.data.balance) : "—"}</strong>
            </div>
            <div className="flex justify-between">
              <span>Dívidas em aberto</span>
              <strong className="text-negative">
                {selfDashboard.data ? formatCurrency(selfDashboard.data.debts) : "—"}
              </strong>
            </div>
            <div className="my-1 h-px bg-divider" />
            <div className="flex justify-between text-base">
              <span>
                Projeção {lastProjection ? `${formatMonthLabel(lastProjection.month)}/${lastProjection.year}` : ""}
              </span>
              <strong className={lastProjection && lastProjection.projectedBalance < 0 ? "text-negative" : "text-positive"}>
                {lastProjection ? formatCurrency(lastProjection.projectedBalance) : "—"}
              </strong>
            </div>
          </div>
        </div>

        {hasHousehold && (
          <div className="rounded-xl border border-divider bg-surface p-5 lg:col-span-2">
            <h2 className="mb-4 font-heading text-[15px] font-bold text-text">Individual vs. unificado</h2>
            {comparisonRows ? (
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-left text-text-muted">
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
                      <td className="py-2">{formatCurrency(row.self)}</td>
                      <td className="py-2">{formatCurrency(row.partner)}</td>
                      <td className="py-2 font-bold">{formatCurrency(row.household)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-text-muted">Carregando comparação…</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
