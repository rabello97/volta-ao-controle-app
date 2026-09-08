/** Em qual fatura cai uma compra feita hoje.
 *
 *  Depois do dia de fechamento a fatura do mês já está fechada, então a compra
 *  entra na do mês seguinte. É essa regra que faz "estou na parcela 7" gerar a
 *  parcela 6 no mês corrente — e é justamente o que a tela precisa explicar
 *  antes de salvar, não depois. */
export function faturaDaProximaCompra(closingDay: number, hoje: Date = new Date()): { year: number; month: number } {
  const fechada = hoje.getDate() > closingDay;
  const d = new Date(hoje.getFullYear(), hoje.getMonth() + (fechada ? 1 : 0), 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function rotuloFatura({ year, month }: { year: number; month: number }): string {
  return `${MESES[month - 1]}/${year}`;
}
