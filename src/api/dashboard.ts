import { apiRequest } from "./client";
import type { CategorySummaryEntry, DashboardTotals, ProjectionEntry } from "./types";

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

export function getCategorySummary(from: string, to: string): Promise<CategorySummaryEntry[]> {
  return apiRequest<CategorySummaryEntry[]>("/dashboard/by-category", { query: { from, to } });
}
