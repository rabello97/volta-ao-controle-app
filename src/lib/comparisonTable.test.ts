import { describe, expect, it } from "vitest";
import { buildComparisonRows } from "./comparisonTable";
import type { DashboardTotals } from "@/api/types";

describe("buildComparisonRows", () => {
  it("monta uma linha por métrica com os três valores (própria, parceiro, unificado)", () => {
    const self: DashboardTotals = { income: 1000, expense: 400, balance: 600, debts: 100 };
    const partner: DashboardTotals = { income: 500, expense: 200, balance: 300, debts: 50 };
    const household: DashboardTotals = { income: 1500, expense: 600, balance: 900, debts: 150 };

    const rows = buildComparisonRows(self, partner, household);

    expect(rows).toEqual([
      { label: "Entradas", self: 1000, partner: 500, household: 1500 },
      { label: "Saídas", self: 400, partner: 200, household: 600 },
      { label: "Saldo", self: 600, partner: 300, household: 900 },
      { label: "Dívidas", self: 100, partner: 50, household: 150 },
    ]);
  });
});
