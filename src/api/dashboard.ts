import { apiRequest } from "./client";
import type {
  BalancePoint,
  CategoryInsight,
  CategorySummaryEntry,
  DashboardTotals,
  ProjectionEntry,
  UpcomingDueItem,
} from "./types";

export function getMyDashboard(): Promise<DashboardTotals> {
  return apiRequest<DashboardTotals>("/dashboard/me");
}

export function getMemberDashboard(userId: string): Promise<DashboardTotals> {
  return apiRequest<DashboardTotals>(`/dashboard/member/${userId}`);
}

export function getHouseholdDashboard(): Promise<DashboardTotals> {
  return apiRequest<DashboardTotals>("/dashboard/household");
}

export function getProjection(months = 6): Promise<ProjectionEntry[]> {
  return apiRequest<ProjectionEntry[]>("/dashboard/projection", { query: { months } });
}

export function getCategorySummary(from: string, to: string, scope?: string): Promise<CategorySummaryEntry[]> {
  return apiRequest<CategorySummaryEntry[]>("/dashboard/by-category", { query: { from, to, scope } });
}

export function getUpcomingDue(scope?: string): Promise<UpcomingDueItem[]> {
  return apiRequest<UpcomingDueItem[]>("/dashboard/upcoming", { query: { scope } });
}

export function getBalanceSeries(days = 30, scope?: string): Promise<BalancePoint[]> {
  return apiRequest<BalancePoint[]>("/dashboard/balance-series", { query: { days, scope } });
}

export function getCategoryInsight(scope?: string): Promise<CategoryInsight | null> {
  return apiRequest<CategoryInsight | null>("/dashboard/category-insight", { query: { scope } });
}
