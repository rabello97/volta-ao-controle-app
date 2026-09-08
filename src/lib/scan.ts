import type { ScanResult } from "@/api/types";

/** Só o que o mapeamento precisa — serve tanto para CreditCard quanto para
 *  CreditCardSummary, que é o que as telas têm em mãos. */
interface CardRef {
  id: string;
  nickname: string;
}

export type ScanDraft = Record<string, unknown>;

/** Converte o que a IA leu da imagem no rascunho do formulário de transação.
 *  Fica aqui, e não na tela, porque o mesmo scan pode partir da barra lateral,
 *  do FAB ou da própria lista — e todos precisam do mesmo mapeamento. */
export function draftFromScan(result: ScanResult, cards: CardRef[] | undefined): ScanDraft {
  const card = (cards ?? []).find(
    (c) => result.cartaoSugerido && c.nickname.toLowerCase() === result.cartaoSugerido.toLowerCase(),
  );

  return {
    type: result.tipo,
    amount: result.valor,
    date: result.data || new Date().toISOString().slice(0, 10),
    category: result.categoriaSugerida,
    description: result.descricao || result.estabelecimento,
    ...(result.parcelas > 1 ? { installmentTotal: result.parcelas } : {}),
    ...(card ? { creditCardId: card.id, invoiceChoice: "CURRENT" } : {}),
  };
}
