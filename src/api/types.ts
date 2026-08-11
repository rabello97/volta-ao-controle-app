export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResult {
  token: string;
  user: User;
}

export interface HouseholdMember {
  id: string;
  name: string;
  email: string;
}

export interface HouseholdResponse {
  members: HouseholdMember[];
}

export type TransactionType = "INCOME" | "EXPENSE";
export type InvoiceChoice = "CURRENT" | "NEXT";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: string;
  date: string;
  category: string;
  description: string | null;
  creditCardId: string | null;
  invoiceId: string | null;
  createdAt: string;
}

export interface RecurringBill {
  id: string;
  userId: string;
  name: string;
  expectedAmount: string;
  dueDay: number;
  category: string;
  active: boolean;
  createdAt: string;
}

export interface CreditCard {
  id: string;
  userId: string;
  nickname: string;
  closingDay: number;
  dueDay: number;
  createdAt: string;
}

export interface InvoiceTransaction {
  id: string;
  amount: string;
  category: string;
  date: string;
  description: string | null;
}

export interface InvoiceDetail {
  id: string;
  referenceMonth: number;
  referenceYear: number;
  dueDate: string;
  total: string;
  transactions: InvoiceTransaction[];
}

export interface DashboardTotals {
  income: number;
  expense: number;
  balance: number;
  debts: number;
}

export interface ProjectionEntry {
  month: number;
  year: number;
  projectedBalance: number;
}

export interface CategorySummaryEntry {
  category: string;
  total: number;
}
