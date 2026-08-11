import { useQueries, useQuery } from "@tanstack/react-query";
import { listRecurringBills } from "@/api/recurringBills";
import { getInvoiceByMonth, listCreditCards } from "@/api/creditCards";
import { buildUpcomingItems, currentYearMonth, type UpcomingItem } from "@/lib/upcomingDue";
import type { InvoiceDetail } from "@/api/types";

export function useUpcomingDue(): { items: UpcomingItem[]; isLoading: boolean } {
  const billsQuery = useQuery({ queryKey: ["recurring-bills"], queryFn: listRecurringBills });
  const cardsQuery = useQuery({ queryKey: ["credit-cards"], queryFn: listCreditCards });
  const cards = cardsQuery.data ?? [];
  const { year, month } = currentYearMonth();

  const invoiceQueries = useQueries({
    queries: cards.map((card) => ({
      queryKey: ["invoice", card.id, year, month],
      queryFn: () => getInvoiceByMonth(card.id, year, month),
      enabled: cardsQuery.isSuccess,
    })),
  });

  const isLoading =
    billsQuery.isLoading || cardsQuery.isLoading || invoiceQueries.some((query) => query.isLoading);

  const invoicesByCardId: Record<string, InvoiceDetail | undefined> = {};
  cards.forEach((card, index) => {
    invoicesByCardId[card.id] = invoiceQueries[index]?.data;
  });

  const items = buildUpcomingItems(billsQuery.data ?? [], cards, invoicesByCardId);

  return { items, isLoading };
}
