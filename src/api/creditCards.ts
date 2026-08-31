import { apiRequest } from "./client";
import type { CreditCard, CreditCardSummary, InvoiceDetail } from "./types";

export interface CreditCardInput {
  nickname: string;
  closingDay: number;
  dueDay: number;
  creditLimit?: number | null;
}

export function listCreditCards(scope?: string): Promise<CreditCardSummary[]> {
  return apiRequest<CreditCardSummary[]>("/credit-cards", { query: { scope } });
}

export function createCreditCard(input: CreditCardInput): Promise<CreditCard> {
  return apiRequest<CreditCard>("/credit-cards", { method: "POST", body: input });
}

export function updateCreditCard(id: string, input: Partial<CreditCardInput>): Promise<CreditCard> {
  return apiRequest<CreditCard>(`/credit-cards/${id}`, { method: "PATCH", body: input });
}

export function deleteCreditCard(id: string): Promise<void> {
  return apiRequest<void>(`/credit-cards/${id}`, { method: "DELETE" });
}

export function getInvoiceByMonth(cardId: string, year: number, month: number): Promise<InvoiceDetail> {
  return apiRequest<InvoiceDetail>(`/credit-cards/${cardId}/invoices/${year}/${month}`);
}
