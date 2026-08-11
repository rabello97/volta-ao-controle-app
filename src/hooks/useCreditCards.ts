import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCreditCard,
  getInvoiceByMonth,
  listCreditCards,
  type CreditCardInput,
} from "@/api/creditCards";
import { currentYearMonth } from "@/lib/upcomingDue";
import type { CreditCard } from "@/api/types";

export function useCreditCards() {
  return useQuery({ queryKey: ["credit-cards"], queryFn: listCreditCards });
}

export interface CreditCardWithCurrentInvoice extends CreditCard {
  currentInvoiceTotal: number | null;
}

export function useCreditCardsWithCurrentInvoice(): {
  cards: CreditCardWithCurrentInvoice[];
  isLoading: boolean;
} {
  const cardsQuery = useCreditCards();
  const cards = cardsQuery.data ?? [];
  const { year, month } = currentYearMonth();

  const invoiceQueries = useQueries({
    queries: cards.map((card) => ({
      queryKey: ["invoice", card.id, year, month],
      queryFn: () => getInvoiceByMonth(card.id, year, month),
      enabled: cardsQuery.isSuccess,
    })),
  });

  const enriched = cards.map((card, index) => ({
    ...card,
    currentInvoiceTotal: invoiceQueries[index]?.data ? Number(invoiceQueries[index]!.data!.total) : null,
  }));

  return {
    cards: enriched,
    isLoading: cardsQuery.isLoading || invoiceQueries.some((q) => q.isLoading),
  };
}

export function useCreateCreditCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreditCardInput) => createCreditCard(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["credit-cards"] }),
  });
}

export function useInvoice(cardId: string, year: number, month: number) {
  return useQuery({
    queryKey: ["invoice", cardId, year, month],
    queryFn: () => getInvoiceByMonth(cardId, year, month),
    enabled: Boolean(cardId),
  });
}
