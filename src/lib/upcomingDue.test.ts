import { describe, expect, it } from "vitest";
import { buildUpcomingItems, currentInvoiceReference, filterDueSoon, isDueSoon } from "./upcomingDue";
import type { CreditCard, InvoiceDetail, RecurringBill } from "@/api/types";

const referenceDate = new Date(2026, 2, 10); // 10 de março de 2026

function makeBill(overrides: Partial<RecurringBill> = {}): RecurringBill {
  return {
    id: "bill-1",
    userId: "user-1",
    name: "Internet",
    expectedAmount: "120",
    dueDay: 15,
    category: "moradia",
    active: true,
    createdAt: "2026-01-01",
    ...overrides,
  };
}

function makeCard(overrides: Partial<CreditCard> = {}): CreditCard {
  return {
    id: "card-1",
    userId: "user-1",
    nickname: "Nubank",
    closingDay: 10,
    dueDay: 17,
    createdAt: "2026-01-01",
    ...overrides,
  };
}

function makeInvoice(overrides: Partial<InvoiceDetail> = {}): InvoiceDetail {
  return {
    id: "invoice-1",
    referenceMonth: 3,
    referenceYear: 2026,
    dueDate: "2026-03-17",
    total: "300",
    transactions: [],
    ...overrides,
  };
}

describe("buildUpcomingItems", () => {
  it("inclui contas recorrentes ativas e ignora as inativas", () => {
    const items = buildUpcomingItems(
      [makeBill({ id: "b1", active: true }), makeBill({ id: "b2", active: false })],
      [],
      {},
      referenceDate,
    );
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe("bill-b1");
  });

  it("inclui faturas com total positivo e ignora faturas zeradas ou ausentes", () => {
    const card = makeCard();
    const items = buildUpcomingItems(
      [],
      [card, makeCard({ id: "card-2" })],
      { [card.id]: makeInvoice({ total: "300" }) },
      referenceDate,
    );
    expect(items).toHaveLength(1);
    expect(items[0].kind).toBe("invoice");
    expect(items[0].amount).toBe(300);
  });

  it("ordena os itens por data de vencimento", () => {
    const card = makeCard();
    const items = buildUpcomingItems(
      [makeBill({ dueDay: 25 })],
      [card],
      { [card.id]: makeInvoice({ dueDate: "2026-03-05" }) },
      referenceDate,
    );
    expect(items[0].kind).toBe("invoice");
    expect(items[1].kind).toBe("bill");
  });
});

describe("isDueSoon / filterDueSoon", () => {
  it("considera dentro da janela um item que vence hoje", () => {
    const items = buildUpcomingItems([makeBill({ dueDay: 10 })], [], {}, referenceDate);
    expect(isDueSoon(items[0], referenceDate, 5)).toBe(true);
  });

  it("considera fora da janela um item que vence depois do limite de dias", () => {
    const items = buildUpcomingItems([makeBill({ dueDay: 25 })], [], {}, referenceDate);
    expect(isDueSoon(items[0], referenceDate, 5)).toBe(false);
  });

  it("filterDueSoon retorna apenas os itens dentro da janela", () => {
    const items = buildUpcomingItems(
      [makeBill({ id: "perto", dueDay: 12 }), makeBill({ id: "longe", dueDay: 28 })],
      [],
      {},
      referenceDate,
    );
    const dueSoon = filterDueSoon(items, referenceDate, 5);
    expect(dueSoon).toHaveLength(1);
    expect(dueSoon[0].id).toBe("bill-perto");
  });
});

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
