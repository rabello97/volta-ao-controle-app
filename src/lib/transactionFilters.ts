import type { TransactionType } from "@/api/types";
import type { TransactionFilters } from "@/api/transactions";

export function buildTransactionFilters(
  type: TransactionType | "ALL",
  category: string,
  creditCardId: string,
  search: string,
  page: number,
): TransactionFilters {
  return {
    type: type === "ALL" ? undefined : type,
    category: category || undefined,
    creditCardId: creditCardId || undefined,
    search: search || undefined,
    page,
    limit: 10,
  };
}
