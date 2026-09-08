import type { CreditCardSummary, InstallmentPlan } from "@/api/types";

export interface PontoDaTrajetoria {
  year: number;
  month: number;
  /** Soma das parcelas que ainda caem neste mês. */
  peso: number;
  /** O que sai de cena a partir daqui, para explicar a queda. */
  encerrando: string[];
}

/** Tudo que ainda será cobrado: faturas abertas mais o que resta das compras
 *  parceladas. A fatura entra porque ela vence no mês que vem — é dívida, não
 *  gasto do mês passado. */
export function totalDevido(cards: CreditCardSummary[], plans: InstallmentPlan[]): number {
  const faturas = cards.reduce((soma, c) => soma + c.currentInvoiceTotal, 0);
  const parcelas = plans.filter((p) => !p.finished).reduce((soma, p) => soma + p.remainingTotal, 0);
  return faturas + parcelas;
}

/** Quanto de parcela cai por mês enquanto todas durarem. */
export function pesoMensal(plans: InstallmentPlan[]): number {
  return plans.filter((p) => !p.finished).reduce((soma, p) => soma + p.installmentAmount, 0);
}

function chaveDoMes(d: Date): number {
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
}

/** O peso das parcelas mês a mês daqui para a frente.
 *
 *  É o número que faz a tela valer a pena: o saldo devedor assusta e não sugere
 *  nada, mas ver o peso cair em novembro porque duas compras terminam é
 *  informação que dá vontade de olhar de novo. */
export function trajetoria(plans: InstallmentPlan[], meses = 12, hoje: Date = new Date()): PontoDaTrajetoria[] {
  const ativos = plans.filter((p) => !p.finished);
  const inicio = new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), 1));
  const pontos: PontoDaTrajetoria[] = [];

  for (let i = 0; i < meses; i += 1) {
    const mes = new Date(Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth() + i, 1));
    const chave = chaveDoMes(mes);

    const vigentes = ativos.filter((p) => chaveDoMes(new Date(p.lastDate)) >= chave);
    const encerrando = ativos
      .filter((p) => chaveDoMes(new Date(p.lastDate)) === chave)
      .map((p) => p.description);

    pontos.push({
      year: mes.getUTCFullYear(),
      month: mes.getUTCMonth() + 1,
      peso: vigentes.reduce((soma, p) => soma + p.installmentAmount, 0),
      encerrando,
    });
  }
  return pontos;
}

/** O primeiro mês em que o peso cai, com quanto e por quê. Nulo quando nada
 *  muda no horizonte olhado. */
export function proximoAlivio(
  pontos: PontoDaTrajetoria[],
): { year: number; month: number; queda: number; saindo: string[] } | null {
  for (let i = 1; i < pontos.length; i += 1) {
    const queda = pontos[i - 1].peso - pontos[i].peso;
    if (queda > 0.005) {
      return {
        year: pontos[i].year,
        month: pontos[i].month,
        queda,
        saindo: pontos[i - 1].encerrando,
      };
    }
  }
  return null;
}
