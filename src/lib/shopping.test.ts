import { describe, expect, it } from "vitest";
import { itemTotal, parsePrice, sumItems } from "./shopping";

describe("parsePrice", () => {
  it("aceita vírgula como separador decimal", () => {
    expect(parsePrice("12,90")).toBe(12.9);
  });

  it("aceita ponto e espaços", () => {
    expect(parsePrice(" 12.90 ")).toBe(12.9);
  });

  it("devolve null para vazio", () => {
    expect(parsePrice("")).toBeNull();
  });

  it("devolve null para texto e para negativo", () => {
    expect(parsePrice("abc")).toBeNull();
    expect(parsePrice("-5")).toBeNull();
  });
});

describe("itemTotal", () => {
  it("prefere o preço pago à estimativa", () => {
    expect(itemTotal({ actualPrice: 12, estimatedPrice: 10, quantity: 2 })).toBe(24);
  });

  it("usa a estimativa quando ainda não há preço pago", () => {
    expect(itemTotal({ actualPrice: null, estimatedPrice: 10, quantity: 3 })).toBe(30);
  });

  it("conta zero para item sem preço nenhum", () => {
    expect(itemTotal({ actualPrice: null, estimatedPrice: null, quantity: 5 })).toBe(0);
  });
});

describe("sumItems", () => {
  it("soma a lista inteira", () => {
    expect(
      sumItems([
        { actualPrice: 12.5, estimatedPrice: null, quantity: 2 },
        { actualPrice: null, estimatedPrice: 30, quantity: 1 },
        { actualPrice: null, estimatedPrice: null, quantity: 1 },
      ]),
    ).toBe(55);
  });
});
