import { useQuery } from "@tanstack/react-query";
import { getHouseholdDashboard, getMemberDashboard, getMyDashboard } from "@/api/dashboard";
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
