import { describe, expect, it } from "vitest";
import { pesoMensal, proximoAlivio, totalDevido, trajetoria } from "./debt";
import type { CreditCardSummary, InstallmentPlan } from "@/api/types";

const card = (over: Partial<CreditCardSummary> = {}): CreditCardSummary => ({
  id: "c", nickname: "Nubank", closingDay: 3, dueDay: 10,
  creditLimit: null, currentInvoiceTotal: 0, utilizationPct: null, ...over,
});

const plano = (over: Partial<InstallmentPlan> = {}): InstallmentPlan => ({
  groupId: "g", description: "Compra", category: "casa", ownerId: "u",
  creditCardId: null, creditCardName: null, installmentTotal: 10, paidCount: 5,
  remainingCount: 5, installmentAmount: 100, total: 1000, remainingTotal: 500,
  firstDate: "2026-01-08", lastDate: "2026-12-08", finished: false, ...over,
});

const HOJE = new Date(2026, 8, 8); // setembro de 2026

describe("totalDevido", () => {
  it("soma fatura aberta com o que resta das parcelas", () => {
    expect(totalDevido([card({ currentInvoiceTotal: 1500 })], [plano({ remainingTotal: 500 })])).toBe(2000);
  });

  it("ignora parcelamento quitado", () => {
    expect(totalDevido([], [plano({ finished: true, remainingTotal: 0 }), plano({ remainingTotal: 300 })])).toBe(300);
  });
});

describe("pesoMensal", () => {
  it("soma só o que ainda está correndo", () => {
    expect(pesoMensal([plano({ installmentAmount: 100 }), plano({ installmentAmount: 250 })])).toBe(350);
    expect(pesoMensal([plano({ installmentAmount: 100, finished: true })])).toBe(0);
  });
});

describe("trajetoria", () => {
  it("mantém o peso enquanto as parcelas duram e zera depois da última", () => {
    const t = trajetoria([plano({ installmentAmount: 100, lastDate: "2026-11-08" })], 4, HOJE);
    expect(t.map((p) => p.peso)).toEqual([100, 100, 100, 0]); // set, out, nov, dez
    expect(t[0].month).toBe(9);
  });

  it("marca em que mês cada compra termina", () => {
    const t = trajetoria([plano({ description: "Sofá", lastDate: "2026-10-08" })], 3, HOJE);
    expect(t[1].encerrando).toEqual(["Sofá"]);
    expect(t[0].encerrando).toEqual([]);
  });

  it("soma planos com fins diferentes", () => {
    const t = trajetoria(
      [
        plano({ installmentAmount: 100, lastDate: "2026-10-08" }),
        plano({ installmentAmount: 250, lastDate: "2027-03-08" }),
      ],
      4,
      HOJE,
    );
    expect(t.map((p) => p.peso)).toEqual([350, 350, 250, 250]);
  });
});

describe("proximoAlivio", () => {
  it("acha o primeiro mês em que o peso cai e o que saiu", () => {
    const t = trajetoria(
      [
        plano({ description: "Sofá", installmentAmount: 100, lastDate: "2026-10-08" }),
        plano({ description: "TV", installmentAmount: 250, lastDate: "2027-03-08" }),
      ],
      6,
      HOJE,
    );
    const a = proximoAlivio(t);
    expect(a?.month).toBe(11);
    expect(a?.queda).toBe(100);
    expect(a?.saindo).toEqual(["Sofá"]);
  });

  it("devolve nulo quando nada muda no horizonte", () => {
    const t = trajetoria([plano({ lastDate: "2030-01-08" })], 6, HOJE);
    expect(proximoAlivio(t)).toBeNull();
  });
});
