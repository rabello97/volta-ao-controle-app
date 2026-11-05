import type { UpcomingDueItem } from "@/api/types";

export interface GrupoDeContas {
  chave: "atrasadas" | "semana" | "depois" | "pagas";
  titulo: string;
  itens: UpcomingDueItem[];
  total: number;
}

const DIA = 86_400_000;

/** A API manda a data de vencimento como data de calendário ancorada em UTC.
 *  Comparar isso com a meia-noite local joga o dia para trás no Brasil — uma
 *  conta que vence hoje apareceria como atrasada. Lemos ano, mês e dia e
 *  remontamos no fuso local. */
function diaLocal(iso: string): number {
  const [ano, mes, dia] = iso.slice(0, 10).split("-").map(Number);
  return new Date(ano, mes - 1, dia).getTime();
}

/** Agrupa por QUANDO vence, não por tipo.
 *
 *  O app agrupava por natureza do compromisso — fixa, parcelada, fatura — em
 *  três abas. Isso responde "que tipo de conta é esta?", que ninguém pergunta.
 *  Quem bate o olho quer saber o que vence primeiro e quanto é. */
export function agruparPorVencimento(itens: UpcomingDueItem[], hoje = new Date()): GrupoDeContas[] {
  const inicioDeHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime();

  const grupos: GrupoDeContas[] = [
    { chave: "atrasadas", titulo: "Atrasadas", itens: [], total: 0 },
    { chave: "semana", titulo: "Próximos 7 dias", itens: [], total: 0 },
    { chave: "depois", titulo: "Mais para a frente", itens: [], total: 0 },
    { chave: "pagas", titulo: "Já pagas", itens: [], total: 0 },
  ];
  const achar = (c: GrupoDeContas["chave"]) => grupos.find((g) => g.chave === c)!;

  for (const item of itens) {
    const vence = diaLocal(item.dueDate);
    const dias = Math.floor((vence - inicioDeHoje) / DIA);

    const grupo =
      item.status === "PAID"
        ? achar("pagas")
        : item.status === "OVERDUE" || dias < 0
          ? achar("atrasadas")
          : dias <= 7
            ? achar("semana")
            : achar("depois");

    grupo.itens.push(item);
    grupo.total += item.amount;
  }

  return grupos.filter((g) => g.itens.length > 0);
}

/** O que ainda vai sair do bolso — pagas não entram. */
export function totalAPagar(itens: UpcomingDueItem[]): number {
  return itens.filter((i) => i.status !== "PAID").reduce((soma, i) => soma + i.amount, 0);
}

export function totalPago(itens: UpcomingDueItem[]): number {
  return itens.filter((i) => i.status === "PAID").reduce((soma, i) => soma + i.amount, 0);
}

const ROTULO_DO_TIPO: Record<UpcomingDueItem["kind"], string> = {
  RECURRING_BILL: "Conta fixa",
  INVOICE: "Fatura",
  PLANNED: "Previsto",
};

export function rotuloDoTipo(kind: UpcomingDueItem["kind"]): string {
  return ROTULO_DO_TIPO[kind];
}
