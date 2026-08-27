import { describe, expect, it } from "vitest";
import { currentInvoiceReference } from "./upcomingDue";

describe("currentInvoiceReference", () => {
  it("usa o mês corrente quando a data de hoje é antes do fechamento", () => {
    const today = new Date(2026, 7, 5); // 5 de agosto, fecha dia 10
    expect(currentInvoiceReference(10, today)).toEqual({ year: 2026, month: 8 });
  });

  it("avança para o mês seguinte quando a data de hoje já passou do fechamento", () => {
    const today = new Date(2026, 7, 11); // 11 de agosto, fecha dia 10
    expect(currentInvoiceReference(10, today)).toEqual({ year: 2026, month: 9 });
  });

  it("vira o ano quando o fechamento cruza dezembro/janeiro", () => {
    const today = new Date(2026, 11, 15); // 15 de dezembro, fecha dia 10
    expect(currentInvoiceReference(10, today)).toEqual({ year: 2027, month: 1 });
  });
});
