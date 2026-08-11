import { apiRequest } from "./client";
import type { InvoiceChoice, Transaction, TransactionType } from "./types";

export interface TransactionFilters {
  from?: string;
  to?: string;
  category?: string;
  type?: TransactionType;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  date: string;
  category: string;
  description?: string;
  creditCardId?: string;
  invoiceChoice?: InvoiceChoice;
}

export type UpdateTransactionInput = Partial<Omit<TransactionInput, "type">>;

export function listTransactions(filters: TransactionFilters = {}): Promise<Transaction[]> {
  return apiRequest<Transaction[]>("/transactions", { query: { ...filters } });
}

export function createTransaction(input: TransactionInput): Promise<Transaction> {
  return apiRequest<Transaction>("/transactions", { method: "POST", body: input });
}

export function updateTransaction(id: string, input: UpdateTransactionInput): Promise<Transaction> {
  return apiRequest<Transaction>(`/transactions/${id}`, { method: "PATCH", body: input });
}

export function deleteTransaction(id: string): Promise<void> {
  return apiRequest<void>(`/transactions/${id}`, { method: "DELETE" });
}
