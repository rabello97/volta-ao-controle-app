import { apiRequest } from "./client";
import type { BudgetStatus, CategoryBudget } from "./types";

export function listBudgets(scope?: string): Promise<CategoryBudget[]> {
  return apiRequest<CategoryBudget[]>("/budgets", { query: { scope } });
}

export function getBudgetStatus(scope?: string): Promise<BudgetStatus> {
  return apiRequest<BudgetStatus>("/budgets/status", { query: { scope } });
}

export function upsertBudget(category: string, monthlyLimit: number): Promise<CategoryBudget> {
  return apiRequest<CategoryBudget>("/budgets", { method: "PUT", body: { category, monthlyLimit } });
}

export function deleteBudget(id: string): Promise<void> {
  return apiRequest<void>(`/budgets/${id}`, { method: "DELETE" });
}

export function setMonthlyIncome(monthlyIncome: number | null): Promise<void> {
  return apiRequest<void>("/budgets/income", { method: "PUT", body: { monthlyIncome } });
}
