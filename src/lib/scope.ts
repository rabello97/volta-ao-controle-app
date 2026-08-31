import type { HouseholdView } from "@/context/HouseholdViewContext";

/** Traduz a visão escolhida no seletor para o parâmetro `scope` da API:
 *  "self" | "household" | id do parceiro. */
export function scopeFor(view: HouseholdView, partnerId: string | null): string | undefined {
  if (view === "household") return "household";
  if (view === "partner" && partnerId) return partnerId;
  return undefined;
}
