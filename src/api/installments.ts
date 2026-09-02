import { apiRequest } from "./client";
import type { InstallmentPlan } from "./types";

export interface InstallmentPlanInput {
  description: string;
  category: string;
  /** Valor de cada parcela — é o número que aparece na fatura. */
  installmentAmount: number;
  installmentTotal: number;
  /** Em qual parcela a compra está hoje. 1 = compra nova. */
  currentInstallment: number;
  creditCardId: string;
}

export function listInstallmentPlans(scope?: string): Promise<InstallmentPlan[]> {
  return apiRequest<InstallmentPlan[]>("/installments", { query: { scope } });
}

export function createInstallmentPlan(input: InstallmentPlanInput): Promise<InstallmentPlan> {
  return apiRequest<InstallmentPlan>("/installments", { method: "POST", body: input });
}

export function updateInstallmentPlan(
  groupId: string,
  input: { description?: string; category?: string },
): Promise<void> {
  return apiRequest<void>(`/installments/${groupId}`, { method: "PATCH", body: input });
}

export function deleteInstallmentPlan(groupId: string): Promise<void> {
  return apiRequest<void>(`/installments/${groupId}`, { method: "DELETE" });
}
