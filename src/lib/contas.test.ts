import { describe, expect, it } from "vitest";
import { agruparPorVencimento, totalAPagar, totalPago } from "./contas";
import type { UpcomingDueItem } from "@/api/types";

const HOJE = new Date(2026, 10, 5); // 5 de novembro de 2026

const item = (over: Partial<UpcomingDueItem> = {}): UpcomingDueItem => ({
  id: "i", kind: "RECURRING_BILL", name: "Conta", category: "casa",
  amount: 100, dueDate: "2026-11-10", status: "DUE", ownerId: "u1", ...over,
});

describe("agruparPorVencimento", () => {
  it("separa atrasada, próxima semana e depois", () => {
    const g = agruparPorVencimento(
      [
        item({ id: "a", dueDate: "2026-11-01", status: "OVERDUE" }),
        item({ id: "b", dueDate: "2026-11-08" }),
        item({ id: "c", dueDate: "2026-11-28" }),
      ],
      HOJE,
    );
    expect(g.map((x) => x.chave)).toEqual(["atrasadas", "semana", "depois"]);
  });

  it("o que vence hoje conta como próximos 7 dias, não como atrasado", () => {
    const g = agruparPorVencimento([item({ dueDate: "2026-11-05" })], HOJE);
    expect(g[0].chave).toBe("semana");
  });

  it("paga sai do caminho mesmo se a data já passou", () => {
    const g = agruparPorVencimento([item({ dueDate: "2026-11-01", status: "PAID" })], HOJE);
    expect(g[0].chave).toBe("pagas");
  });

  it("não devolve grupo vazio — seção sem conteúdo é ruído", () => {
    const g = agruparPorVencimento([item({ dueDate: "2026-11-08" })], HOJE);
    expect(g).toHaveLength(1);
  });

  it("soma o total de cada grupo", () => {
    const g = agruparPorVencimento(
      [item({ dueDate: "2026-11-08", amount: 100 }), item({ id: "x", dueDate: "2026-11-09", amount: 50 })],
      HOJE,
    );
    expect(g[0].total).toBe(150);
  });
});

describe("totais", () => {
  const lista = [item({ amount: 100 }), item({ id: "p", amount: 40, status: "PAID" })];

  it("a pagar ignora o que já foi pago", () => {
    expect(totalAPagar(lista)).toBe(100);
  });

  it("pago soma só o que saiu", () => {
    expect(totalPago(lista)).toBe(40);
  });
});
