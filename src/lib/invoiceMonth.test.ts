import { describe, expect, it } from "vitest";
import { faturaDaProximaCompra, rotuloFatura } from "./invoiceMonth";

describe("faturaDaProximaCompra", () => {
  it("cai na fatura do mês seguinte quando o cartão já fechou", () => {
    // Nubank fecha dia 3; hoje é 8 de setembro → a compra entra em outubro.
    expect(faturaDaProximaCompra(3, new Date(2026, 8, 8))).toEqual({ year: 2026, month: 10 });
  });

  it("cai na fatura do mês corrente quando ainda não fechou", () => {
    expect(faturaDaProximaCompra(20, new Date(2026, 8, 8))).toEqual({ year: 2026, month: 9 });
  });

  it("no próprio dia do fechamento a fatura ainda é a do mês", () => {
    expect(faturaDaProximaCompra(8, new Date(2026, 8, 8))).toEqual({ year: 2026, month: 9 });
  });

  it("vira o ano em dezembro", () => {
    expect(faturaDaProximaCompra(3, new Date(2026, 11, 20))).toEqual({ year: 2027, month: 1 });
  });

  it("formata o rótulo", () => {
    expect(rotuloFatura({ year: 2026, month: 10 })).toBe("out/2026");
    expect(rotuloFatura({ year: 2027, month: 1 })).toBe("jan/2027");
  });
});
