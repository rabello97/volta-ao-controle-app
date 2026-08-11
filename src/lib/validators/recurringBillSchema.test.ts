import { describe, expect, it } from "vitest";
import { recurringBillFormSchema } from "./recurringBillSchema";

describe("recurringBillFormSchema", () => {
  it("aceita dados válidos", () => {
    const result = recurringBillFormSchema.safeParse({
      name: "Internet",
      expectedAmount: "120",
      dueDay: "10",
      category: "moradia",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita dia de vencimento fora do intervalo 1-31", () => {
    const result = recurringBillFormSchema.safeParse({
      name: "Internet",
      expectedAmount: "120",
      dueDay: "35",
      category: "moradia",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita valor esperado inválido", () => {
    const result = recurringBillFormSchema.safeParse({
      name: "Internet",
      expectedAmount: "-10",
      dueDay: "10",
      category: "moradia",
    });
    expect(result.success).toBe(false);
  });
});
