import { describe, expect, it } from "vitest";
import { aggregateMonthlyTotals } from "./monthlyEvolution";
import type { Transaction } from "@/api/types";

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: "tx-1",
    userId: "user-1",
    type: "EXPENSE",
    amount: "50",
    date: "2026-03-05",
    category: "mercado",
    description: null,
    creditCardId: null,
    invoiceId: null,
    recurringBillId: null,
    installmentNumber: null,
    installmentTotal: null,
    installmentGroupId: null,
    createdAt: "2026-03-05",
    ...overrides,
  };
}

describe("aggregateMonthlyTotals", () => {
  const referenceDate = new Date(2026, 2, 15); // 15 de março de 2026

  it("cria um bucket para cada um dos últimos N meses, mesmo sem transações", () => {
    const buckets = aggregateMonthlyTotals([], 3, referenceDate);
    expect(buckets).toEqual([
      { year: 2026, month: 1, income: 0, expense: 0 },
      { year: 2026, month: 2, income: 0, expense: 0 },
      { year: 2026, month: 3, income: 0, expense: 0 },
    ]);
  });

  it("soma entradas e saídas separadamente no mês correspondente", () => {
    const transactions = [
      makeTransaction({ date: "2026-03-05", amount: "50", type: "EXPENSE" }),
      makeTransaction({ date: "2026-03-20", amount: "30", type: "EXPENSE" }),
      makeTransaction({ date: "2026-03-10", amount: "1000", type: "INCOME" }),
      makeTransaction({ date: "2026-02-10", amount: "100", type: "EXPENSE" }),
    ];
    const buckets = aggregateMonthlyTotals(transactions, 3, referenceDate);
    expect(buckets.find((b) => b.month === 3)).toEqual({ year: 2026, month: 3, income: 1000, expense: 80 });
    expect(buckets.find((b) => b.month === 2)).toEqual({ year: 2026, month: 2, income: 0, expense: 100 });
    expect(buckets.find((b) => b.month === 1)).toEqual({ year: 2026, month: 1, income: 0, expense: 0 });
  });

  it("ignora transações fora da janela de meses", () => {
    const transactions = [makeTransaction({ date: "2025-01-01", amount: "999" })];
    const buckets = aggregateMonthlyTotals(transactions, 3, referenceDate);
    const total = buckets.reduce((sum, b) => sum + b.income + b.expense, 0);
    expect(total).toBe(0);
  });
});
