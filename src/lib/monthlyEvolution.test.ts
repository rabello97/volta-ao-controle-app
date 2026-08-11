import { describe, expect, it } from "vitest";
import { aggregateMonthlyExpenses } from "./monthlyEvolution";
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
    createdAt: "2026-03-05",
    ...overrides,
  };
}

describe("aggregateMonthlyExpenses", () => {
  const referenceDate = new Date(2026, 2, 15); // 15 de março de 2026

  it("cria um bucket para cada um dos últimos N meses, mesmo sem transações", () => {
    const buckets = aggregateMonthlyExpenses([], 3, referenceDate);
    expect(buckets).toEqual([
      { year: 2026, month: 1, total: 0 },
      { year: 2026, month: 2, total: 0 },
      { year: 2026, month: 3, total: 0 },
    ]);
  });

  it("soma os valores das transações no mês correspondente", () => {
    const transactions = [
      makeTransaction({ date: "2026-03-05", amount: "50" }),
      makeTransaction({ date: "2026-03-20", amount: "30" }),
      makeTransaction({ date: "2026-02-10", amount: "100" }),
    ];
    const buckets = aggregateMonthlyExpenses(transactions, 3, referenceDate);
    expect(buckets.find((b) => b.month === 3)?.total).toBe(80);
    expect(buckets.find((b) => b.month === 2)?.total).toBe(100);
    expect(buckets.find((b) => b.month === 1)?.total).toBe(0);
  });

  it("ignora transações fora da janela de meses", () => {
    const transactions = [makeTransaction({ date: "2025-01-01", amount: "999" })];
    const buckets = aggregateMonthlyExpenses(transactions, 3, referenceDate);
    const total = buckets.reduce((sum, b) => sum + b.total, 0);
    expect(total).toBe(0);
  });
});
