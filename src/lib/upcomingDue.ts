import type { CreditCard, InvoiceDetail, RecurringBill } from "@/api/types";

export interface UpcomingItem {
  id: string;
  kind: "bill" | "invoice";
  name: string;
  amount: number;
  dueDate: Date;
}

export function currentYearMonth(referenceDate: Date = new Date()): { year: number; month: number } {
  return { year: referenceDate.getFullYear(), month: referenceDate.getMonth() + 1 };
}

export function buildUpcomingItems(
  bills: RecurringBill[],
  cards: CreditCard[],
  invoicesByCardId: Record<string, InvoiceDetail | undefined>,
  referenceDate: Date = new Date(),
): UpcomingItem[] {
  const { year, month } = currentYearMonth(referenceDate);
  const items: UpcomingItem[] = [];

  for (const bill of bills) {
    if (!bill.active) continue;
    items.push({
      id: `bill-${bill.id}`,
      kind: "bill",
      name: bill.name,
      amount: Number(bill.expectedAmount),
      dueDate: new Date(year, month - 1, bill.dueDay),
    });
  }

  for (const card of cards) {
    const invoice = invoicesByCardId[card.id];
    if (!invoice || Number(invoice.total) <= 0) continue;
    items.push({
      id: `invoice-${invoice.id}`,
      kind: "invoice",
      name: `Fatura ${card.nickname}`,
      amount: Number(invoice.total),
      dueDate: new Date(invoice.dueDate),
    });
  }

  return items.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

export function isDueSoon(item: UpcomingItem, referenceDate: Date = new Date(), windowDays = 5): boolean {
  const startOfToday = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const diffMs = item.dueDate.getTime() - startOfToday.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= windowDays;
}

export function filterDueSoon(
  items: UpcomingItem[],
  referenceDate: Date = new Date(),
  windowDays = 5,
): UpcomingItem[] {
  return items.filter((item) => isDueSoon(item, referenceDate, windowDays));
}
