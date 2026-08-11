import { apiRequest } from "./client";
import type { RecurringBill } from "./types";

export interface RecurringBillInput {
  name: string;
  expectedAmount: number;
  dueDay: number;
  category: string;
}

export interface UpdateRecurringBillInput extends Partial<RecurringBillInput> {
  active?: boolean;
}

export function listRecurringBills(): Promise<RecurringBill[]> {
  return apiRequest<RecurringBill[]>("/recurring-bills");
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
