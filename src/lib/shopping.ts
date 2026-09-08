import type { ShoppingItem } from "@/api/types";
import { parseMoney } from "@/lib/money";

/** Preço digitado num campo livre. Delega a leitura a `parseMoney` para que
 *  "13.500,00" (com separador de milhar) funcione: a versão anterior trocava
 *  só a primeira vírgula e devolvia null para qualquer valor acima de mil —
 *  ou seja, aluguel, salário e renda mensal simplesmente não salvavam. */
export function parsePrice(value: string): number | null {
  const limpo = value.replace(/\s/g, "");
  if (!limpo) return null;
  const parsed = parseMoney(limpo);
  return typeof parsed === "number" && Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

/** Preço pago quando existe; senão a estimativa. Multiplicado pela quantidade. */
export function itemTotal(item: Pick<ShoppingItem, "actualPrice" | "estimatedPrice" | "quantity">): number {
  const unit = item.actualPrice ?? item.estimatedPrice ?? 0;
  return unit * item.quantity;
}

export function sumItems(items: Pick<ShoppingItem, "actualPrice" | "estimatedPrice" | "quantity">[]): number {
  return items.reduce((sum, item) => sum + itemTotal(item), 0);
}
