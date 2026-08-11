import { describe, expect, it } from "vitest";
import { creditCardFormSchema } from "./creditCardSchema";

describe("creditCardFormSchema", () => {
  it("aceita fechamento antes do vencimento", () => {
    const result = creditCardFormSchema.safeParse({ nickname: "Nubank", closingDay: "10", dueDay: "17" });
    expect(result.success).toBe(true);
  });

  it("rejeita fechamento igual ou posterior ao vencimento", () => {
    const result = creditCardFormSchema.safeParse({ nickname: "Nubank", closingDay: "20", dueDay: "17" });
    expect(result.success).toBe(false);
  });

  it("rejeita apelido vazio", () => {
    const result = creditCardFormSchema.safeParse({ nickname: "", closingDay: "10", dueDay: "17" });
    expect(result.success).toBe(false);
  });
});
