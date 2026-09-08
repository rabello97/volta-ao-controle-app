import { describe, expect, it } from "vitest";
import { parseMoney } from "./money";

describe("parseMoney", () => {
  it("aceita o formato brasileiro com vírgula", () => {
    expect(parseMoney("123,45")).toBe(123.45);
  });

  it("aceita separador de milhar com vírgula decimal", () => {
    expect(parseMoney("1.234,56")).toBe(1234.56);
    expect(parseMoney("12.345.678,90")).toBe(12345678.9);
  });

  it("mantém o ponto como decimal quando não há vírgula", () => {
    expect(parseMoney("123.45")).toBe(123.45);
    expect(parseMoney("100")).toBe(100);
  });

  it("devolve a entrada intacta quando não dá para converter", () => {
    expect(parseMoney("abc")).toBe("abc");
    expect(parseMoney("")).toBe("");
    expect(parseMoney(42)).toBe(42);
    expect(parseMoney(undefined)).toBe(undefined);
  });
});
