import { describe, expect, it } from "vitest";
import { transactionFormSchema } from "./transactionSchema";

describe("transactionFormSchema", () => {
  it("aceita uma transação simples válida", () => {
    const result = transactionFormSchema.safeParse({
      type: "EXPENSE",
      amount: "100",
      date: "2026-03-05",
      category: "mercado",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita valor zero ou negativo", () => {
    const result = transactionFormSchema.safeParse({
      type: "EXPENSE",
      amount: "0",
      date: "2026-03-05",
      category: "mercado",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita quando faltam campos obrigatórios", () => {
    const result = transactionFormSchema.safeParse({
      type: "EXPENSE",
      amount: "100",
      date: "",
      category: "",
    });
    expect(result.success).toBe(false);
  });

  it("exige escolha de fatura quando um cartão é informado", () => {
    const result = transactionFormSchema.safeParse({
      type: "EXPENSE",
      amount: "100",
      date: "2026-03-05",
      category: "mercado",
      creditCardId: "card-1",
    });
    expect(result.success).toBe(false);
  });

  it("aceita quando cartão e escolha de fatura são informados juntos", () => {
    const result = transactionFormSchema.safeParse({
      type: "EXPENSE",
      amount: "100",
      date: "2026-03-05",
      category: "mercado",
      creditCardId: "card-1",
      invoiceChoice: "CURRENT",
    });
    expect(result.success).toBe(true);
  });
});
