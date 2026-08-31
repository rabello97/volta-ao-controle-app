import { describe, expect, it } from "vitest";
import { scopeFor } from "./scope";

describe("scopeFor", () => {
  it("não envia escopo na visão pessoal", () => {
    expect(scopeFor("self", "partner-1")).toBeUndefined();
  });

  it("envia 'household' na visão somada do casal", () => {
    expect(scopeFor("household", "partner-1")).toBe("household");
  });

  it("envia o id do parceiro na visão do parceiro", () => {
    expect(scopeFor("partner", "partner-1")).toBe("partner-1");
  });

  it("cai para a visão pessoal quando não há parceiro vinculado", () => {
    expect(scopeFor("partner", null)).toBeUndefined();
  });
});
