import type { TransactionType } from "@/api/types";
import type { TransactionFilters } from "@/api/transactions";

export function buildTransactionFilters(type: TransactionType | "ALL", category: string): TransactionFilters {
  return {
    type: type === "ALL" ? undefined : type,
    category: category || undefined,
  };
}
