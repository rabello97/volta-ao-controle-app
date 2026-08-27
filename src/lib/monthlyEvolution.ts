import type { Transaction } from "@/api/types";

export interface MonthlyTotal {
  year: number;
  month: number;
  income: number;
  expense: number;
}

export function aggregateMonthlyTotals(
  transactions: Transaction[],
  months: number,
  referenceDate: Date = new Date(),
): MonthlyTotal[] {
  const buckets: MonthlyTotal[] = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1);
    buckets.push({ year: d.getFullYear(), month: d.getMonth() + 1, income: 0, expense: 0 });
  }

  const bucketIndex = new Map(buckets.map((bucket, idx) => [`${bucket.year}-${bucket.month}`, idx]));

  for (const transaction of transactions) {
    const date = new Date(transaction.date);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const idx = bucketIndex.get(key);
    if (idx !== undefined) {
      if (transaction.type === "INCOME") {
        buckets[idx].income += Number(transaction.amount);
      } else {
        buckets[idx].expense += Number(transaction.amount);
      }
    }
  }

  return buckets;
}

export function sixMonthsAgoDateRange(referenceDate: Date = new Date()): { from: string; to: string } {
  const from = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 5, 1);
  const to = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}
