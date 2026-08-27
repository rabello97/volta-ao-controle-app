import { apiRequest } from "./client";
import type { InvoiceChoice, TransactionListResult, TransactionType } from "./types";

export interface TransactionFilters {
  from?: string;
  to?: string;
  category?: string;
  type?: TransactionType;
  creditCardId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  date: string;
  category: string;
  description?: string;
  creditCardId?: string;
  invoiceChoice?: InvoiceChoice;
  recurringBillId?: string;
  installmentTotal?: number;
}

export type UpdateTransactionInput = Partial<Omit<TransactionInput, "type" | "creditCardId" | "invoiceChoice" | "recurringBillId" | "installmentTotal">>;

export function listTransactions(filters: TransactionFilters = {}): Promise<TransactionListResult> {
  return apiRequest<TransactionListResult>("/transactions", { query: { ...filters } });
}

export function createTransaction(input: TransactionInput) {
  return apiRequest("/transactions", { method: "POST", body: input });
}

export function updateTransaction(id: string, input: UpdateTransactionInput) {
  return apiRequest(`/transactions/${id}`, { method: "PATCH", body: input });
}

export function deleteTransaction(id: string): Promise<void> {
  return apiRequest<void>(`/transactions/${id}`, { method: "DELETE" });
}
