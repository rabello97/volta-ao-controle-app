import { apiRequest } from "./client";
import type { InvoiceChoice, MoneySource, Transaction, TransactionListResult, TransactionType } from "./types";

export interface TransactionFilters {
  from?: string;
  to?: string;
  category?: string;
  type?: TransactionType;
  creditCardId?: string;
  search?: string;
  page?: number;
  limit?: number;
  scope?: string;
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
  /** Pagar com um benefício (VR). Exclui cartão. */
  walletId?: string;
  /** Dinheiro que só mudou de bolso dentro do casal. */
  transferPeerUserId?: string;
  /** Só para entradas: de onde veio o dinheiro. */
  moneySource?: MoneySource;
}

/** O que o formulário devolve: igual à criação, mas o cartão pode vir `null`
 *  quando o usuário desvincula uma transação existente. */
export type TransactionFormPayload = Omit<TransactionInput, "creditCardId"> & {
  creditCardId?: string | null;
};

export type UpdateTransactionInput = Partial<
  Omit<TransactionInput, "type" | "recurringBillId" | "installmentTotal" | "creditCardId">
> & {
  /** Trocar de cartão; `null` desvincula e vira despesa avulsa. */
  creditCardId?: string | null;
};

export function listTransactions(filters: TransactionFilters = {}): Promise<TransactionListResult> {
  return apiRequest<TransactionListResult>("/transactions", { query: { ...filters } });
}

export function createTransaction(input: TransactionInput): Promise<Transaction> {
  return apiRequest<Transaction>("/transactions", { method: "POST", body: input });
}

export function updateTransaction(id: string, input: UpdateTransactionInput) {
  return apiRequest(`/transactions/${id}`, { method: "PATCH", body: input });
}

export function deleteTransaction(id: string): Promise<void> {
  return apiRequest<void>(`/transactions/${id}`, { method: "DELETE" });
}

/** Entradas que dizem "veio do parceiro" e ainda esperam ele informar a origem. */
export function listPendingSourceConfirmations(): Promise<Transaction[]> {
  return apiRequest<Transaction[]>("/transactions/origem-pendente");
}

export function confirmMoneySource(
  id: string,
  input: {
    source: Exclude<MoneySource, "PARTNER">;
    registrarNaMinhaConta?: boolean;
    creditCardId?: string;
    invoiceChoice?: InvoiceChoice;
  },
): Promise<Transaction> {
  return apiRequest<Transaction>(`/transactions/${id}/confirmar-origem`, { method: "POST", body: input });
}
