import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { HouseholdViewToggle } from "@/components/HouseholdViewToggle";
import { ShoppingLists } from "@/components/ShoppingLists";
import { HouseAgenda } from "@/components/HouseAgenda";
import { useHouseholdView } from "@/context/HouseholdViewContext";
import { scopeFor } from "@/lib/scope";
import { cn } from "@/lib/utils";

const ABAS = [
  { key: "compras", label: "Lista de compras" },
  { key: "agenda", label: "Agenda da casa" },
] as const;

type Aba = (typeof ABAS)[number]["key"];

/** As duas coisas da casa que não são "conta do mês": o que falta comprar e o
 *  que vence em data. Ficam sob a mesma aba para não crescer a barra inferior,
 *  que no celular já está no limite de itens. */
export function HousePage() {
  const { view, partner } = useHouseholdView();
  const scope = scopeFor(view, partner?.id ?? null);
  const [aba, setAba] = useState<Aba>("compras");

  return (
    <>
      <PageHeader
        title="Casa"
        subtitle={aba === "compras" ? "Anote o que falta em casa" : "O que a casa cobra em data"}
        aside={<HouseholdViewToggle />}
      />

      <div className="mb-4 flex w-fit gap-0.5 rounded-[10px] border border-divider bg-surface p-[3px]">
        {ABAS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setAba(opt.key)}
            className={cn(
              "whitespace-nowrap rounded-lg px-3.5 py-1.5 text-[13px] transition-colors",
              aba === opt.key ? "bg-track font-medium text-text" : "text-text-3 hover:text-text",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {aba === "compras" ? <ShoppingLists scope={scope} /> : <HouseAgenda scope={scope} />}
    </>
  );
}
