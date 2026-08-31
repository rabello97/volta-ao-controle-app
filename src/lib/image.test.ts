import { describe, expect, it } from "vitest";
import { fitWithin, stripDataUrlPrefix } from "./image";

describe("stripDataUrlPrefix", () => {
  it("remove o cabeçalho data:", () => {
    expect(stripDataUrlPrefix("data:image/jpeg;base64,AAAA")).toBe("AAAA");
  });

  it("deixa passar quem já vem sem cabeçalho", () => {
    expect(stripDataUrlPrefix("AAAA")).toBe("AAAA");
  });
});

describe("fitWithin", () => {
  it("não aumenta imagem pequena", () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it("reduz mantendo a proporção pelo maior lado", () => {
    expect(fitWithin(3200, 2400)).toEqual({ width: 1600, height: 1200 });
  });

  it("funciona com foto em pé", () => {
    expect(fitWithin(2400, 3200)).toEqual({ width: 1200, height: 1600 });
  });
});
