export interface User {
  id: string;
  name: string;
  email: string;
  theme: "light" | "dark" | null;
  savingsGoalTarget: number | null;
  savingsGoalSaved: number | null;
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

export type InviteStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface HouseholdInvite {
  id: string;
  householdId: string | null;
  fromUserId: string;
  toEmail: string;
  status: InviteStatus;
  createdAt: string;
}

export interface HouseholdInvitesResponse {
  sent: HouseholdInvite[];
  received: HouseholdInvite[];
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
  recurringBillId: string | null;
  installmentNumber: number | null;
  installmentTotal: number | null;
  installmentGroupId: string | null;
  createdAt: string;
}

export interface TransactionListResult {
  items: Transaction[];
  total: number;
  page: number;
  limit: number;
  totals: { income: number; expense: number };
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

export interface RecurringBillMonthlyStats {
  fixedMonthlyCost: number;
  paidCount: number;
  totalActive: number;
  nextDue: { billId: string; name: string; dueDay: number } | null;
}

export interface RecurringBillWithStatus {
  id: string;
  name: string;
  category: string;
  dueDay: number;
  expectedAmount: number;
  active: boolean;
  paidThisMonth: boolean;
  averageLast3Months: number;
}

export interface CreditCard {
  id: string;
  userId: string;
  nickname: string;
  closingDay: number;
  dueDay: number;
  creditLimit: string | null;
  createdAt: string;
}

export interface CreditCardSummary {
  id: string;
  nickname: string;
  closingDay: number;
  dueDay: number;
  creditLimit: number | null;
  currentInvoiceTotal: number;
  utilizationPct: number | null;
}

export interface InvoiceTransaction {
  id: string;
  amount: string;
  category: string;
  date: string;
  description: string | null;
  installmentNumber: number | null;
  installmentTotal: number | null;
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

export interface CategoryInsight {
  category: string;
  changePct: number;
}

export type UpcomingDueStatus = "PAID" | "DUE" | "OVERDUE";

export interface UpcomingDueItem {
  id: string;
  kind: "RECURRING_BILL" | "INVOICE";
  name: string;
  category: string;
  amount: number;
  dueDate: string;
  status: UpcomingDueStatus;
  recurringBillId?: string;
  creditCardId?: string;
}

export interface BalancePoint {
  date: string;
  balance: number;
}
