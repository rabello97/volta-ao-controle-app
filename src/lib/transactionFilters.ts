import type { TransactionType } from "@/api/types";
import type { TransactionFilters } from "@/api/transactions";

export function buildTransactionFilters(
  type: TransactionType | "ALL",
  category: string,
  creditCardId: string,
  search: string,
  page: number,
  /** Recorte de mês vindo do seletor no cabeçalho. */
  range?: { from: string; to: string },
): TransactionFilters {
  return {
    type: type === "ALL" ? undefined : type,
    category: category || undefined,
    creditCardId: creditCardId || undefined,
    search: search || undefined,
    from: range?.from,
    to: range?.to,
    page,
    limit: 10,
  };
}
