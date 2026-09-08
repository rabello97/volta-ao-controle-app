import { describe, expect, it } from "vitest";
import { fraseDaAcao, fraseDeConfirmacao, valorFalado } from "./speech";

const acao = (over: Record<string, unknown> = {}) =>
  ({
    tipo: "criar_transacao",
    resumo: "",
    transacao: {
      type: "EXPENSE",
      amount: 45,
      date: "2026-09-08",
      category: "transporte",
      description: "Posto",
      creditCardNickname: "",
      walletName: "",
      installmentTotal: 1,
      ...over,
    },
  }) as never;

describe("valorFalado", () => {
  it("omite os centavos quando são zero", () => {
    expect(valorFalado(45)).toBe("45 reais");
    expect(valorFalado(1410)).toBe("1410 reais");
  });

  it("fala os centavos quando existem", () => {
    expect(valorFalado(45.9)).toBe("45 reais e 90 centavos");
    expect(valorFalado(342.18)).toBe("342 reais e 18 centavos");
  });

  it("usa o singular", () => {
    expect(valorFalado(1)).toBe("1 real");
    expect(valorFalado(1.01)).toBe("1 real e 1 centavo");
  });

  it("arredonda sem criar centavo fantasma", () => {
    expect(valorFalado(0.1 + 0.2)).toBe("0 reais e 30 centavos");
  });
});

describe("fraseDaAcao", () => {
  it("descreve uma saída simples", () => {
    expect(fraseDaAcao(acao())).toBe("Saída de 45 reais em transporte");
  });

  it("inclui cartão e parcelas", () => {
    expect(fraseDaAcao(acao({ creditCardNickname: "Nubank", installmentTotal: 6, amount: 600 }))).toBe(
      "Saída de 600 reais em transporte, no cartão Nubank, em 6 vezes",
    );
  });

  it("distingue entrada de saída", () => {
    expect(fraseDaAcao(acao({ type: "INCOME", category: "salário" }))).toContain("Entrada de");
  });

  it("pergunta ao fim, e conta quando é mais de um", () => {
    expect(fraseDeConfirmacao([acao()])).toMatch(/Confirma\?$/);
    expect(fraseDeConfirmacao([acao(), acao()])).toMatch(/^2 lançamentos/);
    expect(fraseDeConfirmacao([])).toBe("");
  });
});
