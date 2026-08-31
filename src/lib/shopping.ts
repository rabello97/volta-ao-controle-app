import type { ShoppingItem } from "@/api/types";

/** Aceita "12,90" e "12.90" — no celular o teclado decimal manda vírgula.
 *  Devolve null para vazio ou valor inválido, que é como a API entende
 *  "esse item ainda não tem preço". */
export function parsePrice(value: string): number | null {
  const clean = value.replace(/\s/g, "").replace(",", ".");
  if (!clean) return null;
  const parsed = Number(clean);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

/** Preço pago quando existe; senão a estimativa. Multiplicado pela quantidade. */
export function itemTotal(item: Pick<ShoppingItem, "actualPrice" | "estimatedPrice" | "quantity">): number {
  const unit = item.actualPrice ?? item.estimatedPrice ?? 0;
  return unit * item.quantity;
}

export function sumItems(items: Pick<ShoppingItem, "actualPrice" | "estimatedPrice" | "quantity">[]): number {
  return items.reduce((sum, item) => sum + itemTotal(item), 0);
}
