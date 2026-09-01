import { describe, expect, it } from "vitest";
import { plural } from "./plural";

describe("plural", () => {
  it("usa o singular para um", () => {
    expect(plural(1, "conta")).toBe("1 conta");
  });

  it("usa o plural para zero", () => {
    expect(plural(0, "conta")).toBe("0 contas");
  });

  it("usa o plural para muitos", () => {
    expect(plural(3, "lançamento")).toBe("3 lançamentos");
  });

  it("aceita plural irregular", () => {
    expect(plural(2, "item", "itens")).toBe("2 itens");
    expect(plural(1, "item", "itens")).toBe("1 item");
  });
});
