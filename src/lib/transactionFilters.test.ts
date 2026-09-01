import { describe, expect, it } from "vitest";
import { buildTransactionFilters } from "./transactionFilters";

describe("buildTransactionFilters", () => {
  it("omite o tipo quando a seleção é 'ALL'", () => {
    expect(buildTransactionFilters("ALL", "", "", "", 1)).toEqual({
      type: undefined,
      category: undefined,
      creditCardId: undefined,
      search: undefined,
      page: 1,
      limit: 10,
    });
  });

  it("inclui o tipo quando uma opção específica é selecionada", () => {
    expect(buildTransactionFilters("EXPENSE", "", "", "", 1)).toEqual(
      expect.objectContaining({ type: "EXPENSE" }),
    );
  });

  it("inclui categoria, cartão e busca quando informados", () => {
    expect(buildTransactionFilters("ALL", "mercado", "card-1", "uber", 2)).toEqual({
      type: undefined,
      category: "mercado",
      creditCardId: "card-1",
      search: "uber",
      page: 2,
      limit: 10,
    });
  });
});

describe("recorte de mês", () => {
  it("passa o período quando o mês é informado", () => {
    const filtros = buildTransactionFilters("ALL", "", "", "", 1, { from: "2026-09-01", to: "2026-09-30" });
    expect(filtros.from).toBe("2026-09-01");
    expect(filtros.to).toBe("2026-09-30");
  });

  it("sem mês informado não filtra por período", () => {
    const filtros = buildTransactionFilters("ALL", "", "", "", 1);
    expect(filtros.from).toBeUndefined();
    expect(filtros.to).toBeUndefined();
  });
});
