import { apiRequest } from "./client";
import type { RecurringBill, RecurringBillMonthlyStats, RecurringBillWithStatus, Transaction } from "./types";

export interface RecurringBillInput {
  name: string;
  expectedAmount: number;
  dueDay: number;
  category: string;
}

export interface UpdateRecurringBillInput extends Partial<RecurringBillInput> {
  active?: boolean;
}

export function listRecurringBills(scope?: string): Promise<RecurringBill[]> {
  return apiRequest<RecurringBill[]>("/recurring-bills", { query: { scope } });
}

export function createRecurringBill(input: RecurringBillInput): Promise<RecurringBill> {
  return apiRequest<RecurringBill>("/recurring-bills", { method: "POST", body: input });
}

export function updateRecurringBill(id: string, input: UpdateRecurringBillInput): Promise<RecurringBill> {
  return apiRequest<RecurringBill>(`/recurring-bills/${id}`, { method: "PATCH", body: input });
}

export function deleteRecurringBill(id: string): Promise<void> {
  return apiRequest<void>(`/recurring-bills/${id}`, { method: "DELETE" });
}

export function getRecurringBillStats(scope?: string, month?: string): Promise<RecurringBillMonthlyStats> {
  return apiRequest<RecurringBillMonthlyStats>("/recurring-bills/stats", { query: { scope, month } });
}

export function listRecurringBillsWithStatus(scope?: string, month?: string): Promise<RecurringBillWithStatus[]> {
  return apiRequest<RecurringBillWithStatus[]>("/recurring-bills/with-status", { query: { scope, month } });
}

export function payRecurringBill(id: string): Promise<Transaction> {
  return apiRequest<Transaction>(`/recurring-bills/${id}/pay`, { method: "POST" });
}
