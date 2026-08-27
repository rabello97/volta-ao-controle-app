export function currentYearMonth(referenceDate: Date = new Date()): { year: number; month: number } {
  return { year: referenceDate.getFullYear(), month: referenceDate.getMonth() + 1 };
}

export function addMonths(ref: { year: number; month: number }, delta: number): { year: number; month: number } {
  let monthIndex = ref.month - 1 + delta;
  let year = ref.year + Math.floor(monthIndex / 12);
  monthIndex = ((monthIndex % 12) + 12) % 12;
  return { year, month: monthIndex + 1 };
}

/**
 * A fatura "atual" de um cartão depende do dia de fechamento: depois que o mês
 * fecha, novos lançamentos já caem na fatura do mês seguinte. Espelha
 * `computeBaseReference` do backend (src/services/invoiceService.ts) para que a
 * exibição do frontend bata com a fatura em que o backend realmente lança as
 * transações.
 */
export function currentInvoiceReference(
  closingDay: number,
  referenceDate: Date = new Date(),
): { year: number; month: number } {
  const base = currentYearMonth(referenceDate);
  return referenceDate.getDate() > closingDay ? addMonths(base, 1) : base;
}
