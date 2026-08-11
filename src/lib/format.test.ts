import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate, formatMonthLabel } from "./format";

describe("formatCurrency", () => {
  it("formata número em reais", () => {
    expect(formatCurrency(1234.5)).toContain("1.234,50");
  });

  it("aceita valores em string (como vêm da API)", () => {
    expect(formatCurrency("80")).toContain("80,00");
  });
});

describe("formatDate", () => {
  it("formata data ISO no padrão brasileiro", () => {
    expect(formatDate("2026-03-05T00:00:00.000Z")).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

describe("formatMonthLabel", () => {
  it("retorna a abreviação em português do mês", () => {
    expect(formatMonthLabel(1)).toBe("jan");
    expect(formatMonthLabel(12)).toBe("dez");
  });
});
