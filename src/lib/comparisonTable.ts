import type { DashboardTotals } from "@/api/types";

export interface ComparisonRow {
  label: string;
  self: number;
  partner: number;
  household: number;
}

export function buildComparisonRows(
  self: DashboardTotals,
  partner: DashboardTotals,
  household: DashboardTotals,
): ComparisonRow[] {
  return [
    { label: "Entradas", self: self.income, partner: partner.income, household: household.income },
    { label: "Saídas", self: self.expense, partner: partner.expense, household: household.expense },
    { label: "Saldo", self: self.balance, partner: partner.balance, household: household.balance },
    { label: "Dívidas", self: self.debts, partner: partner.debts, household: household.debts },
  ];
}
