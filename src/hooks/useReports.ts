import { useQuery } from "@tanstack/react-query";
import { listTransactions } from "@/api/transactions";
import { getCategorySummary, getHouseholdDashboard, getMemberDashboard, getMyDashboard, getProjection } from "@/api/dashboard";
import { aggregateMonthlyExpenses, sixMonthsAgoDateRange } from "@/lib/monthlyEvolution";

export function useMonthlyEvolution(months = 6) {
  const { from, to } = sixMonthsAgoDateRange();
  return useQuery({
    queryKey: ["transactions-evolution", from, to],
    queryFn: () => listTransactions({ from, to, type: "EXPENSE" }),
    select: (transactions) => aggregateMonthlyExpenses(transactions, months),
  });
}

export function useCategorySummaryThisMonth() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  return useQuery({ queryKey: ["category-summary", from, to], queryFn: () => getCategorySummary(from, to) });
}

export function useProjection(months = 6) {
  return useQuery({ queryKey: ["projection", months], queryFn: () => getProjection(months) });
}

export function useSelfDashboard() {
  return useQuery({ queryKey: ["dashboard", "self"], queryFn: getMyDashboard });
}

export function usePartnerDashboard(partnerId: string | null) {
  return useQuery({
    queryKey: ["dashboard", "partner", partnerId],
    queryFn: () => getMemberDashboard(partnerId as string),
    enabled: Boolean(partnerId),
  });
}

export function useHouseholdDashboard(enabled: boolean) {
  return useQuery({ queryKey: ["dashboard", "household"], queryFn: getHouseholdDashboard, enabled });
}
