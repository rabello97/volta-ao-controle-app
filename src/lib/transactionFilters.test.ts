import { describe, expect, it } from "vitest";
import { buildTransactionFilters } from "./transactionFilters";

describe("buildTransactionFilters", () => {
  it("omite o tipo quando a seleção é 'ALL'", () => {
    expect(buildTransactionFilters("ALL", "")).toEqual({ type: undefined, category: undefined });
  });

  it("inclui o tipo quando uma opção específica é selecionada", () => {
    expect(buildTransactionFilters("EXPENSE", "")).toEqual({ type: "EXPENSE", category: undefined });
  });

  it("inclui a categoria quando informada", () => {
    expect(buildTransactionFilters("ALL", "mercado")).toEqual({ type: undefined, category: "mercado" });
  });
});
