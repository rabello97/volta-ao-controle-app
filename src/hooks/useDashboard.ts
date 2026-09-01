import { useQuery } from "@tanstack/react-query";
import { getBalanceSeries, getCategoryInsight, getHouseholdDashboard, getMemberDashboard, getMyDashboard } from "@/api/dashboard";
import type { HouseholdView } from "@/context/HouseholdViewContext";

export function selectDashboardQueryFn(view: HouseholdView, partnerId: string | null) {
  if (view === "household") return getHouseholdDashboard;
  if (view === "partner" && partnerId) return () => getMemberDashboard(partnerId);
  return getMyDashboard;
}

export function useDashboard(view: HouseholdView, partnerId: string | null) {
  return useQuery({
    queryKey: ["dashboard", view, partnerId],
    queryFn: selectDashboardQueryFn(view, partnerId),
    enabled: view !== "partner" || Boolean(partnerId),
  });
}

export function useBalanceSeries(days = 30, scope?: string) {
  return useQuery({
    queryKey: ["balance-series", days, scope ?? "self"],
    queryFn: () => getBalanceSeries(days, scope),
  });
}

export function useCategoryInsight(scope?: string, month?: string) {
  return useQuery({
    queryKey: ["category-insight", scope ?? "self", month ?? "atual"],
    queryFn: () => getCategoryInsight(scope, month),
  });
}
