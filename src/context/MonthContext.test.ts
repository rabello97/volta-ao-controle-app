import { describe, expect, it } from "vitest";
import { currentMonth, monthKey, monthLabel, monthRange, shiftMonth } from "./MonthContext";

describe("monthKey", () => {
  it("usa o formato que a API espera", () => {
    expect(monthKey({ year: 2026, month: 9 })).toBe("2026-09");
    expect(monthKey({ year: 2026, month: 12 })).toBe("2026-12");
  });
});

describe("shiftMonth", () => {
  it("anda para trás dentro do ano", () => {
    expect(shiftMonth({ year: 2026, month: 9 }, -1)).toEqual({ year: 2026, month: 8 });
  });

  it("vira o ano para trás", () => {
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
  });

  it("vira o ano para frente", () => {
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
  });

  it("anda vários meses de uma vez", () => {
    expect(shiftMonth({ year: 2026, month: 3 }, -6)).toEqual({ year: 2025, month: 9 });
  });
});

describe("monthRange", () => {
  it("pega o mês inteiro", () => {
    expect(monthRange({ year: 2026, month: 9 })).toEqual({ from: "2026-09-01", to: "2026-09-30" });
  });

  it("acerta o último dia de mês curto", () => {
    expect(monthRange({ year: 2026, month: 2 })).toEqual({ from: "2026-02-01", to: "2026-02-28" });
  });

  it("acerta fevereiro em ano bissexto", () => {
    expect(monthRange({ year: 2028, month: 2 })).toEqual({ from: "2028-02-01", to: "2028-02-29" });
  });
});

describe("monthLabel", () => {
  it("escreve o mês por extenso", () => {
    expect(monthLabel({ year: 2026, month: 9 })).toBe("Setembro 2026");
  });
});

describe("currentMonth", () => {
  it("usa o mês da data informada", () => {
    expect(currentMonth(new Date(2026, 8, 17))).toEqual({ year: 2026, month: 9 });
  });
});
