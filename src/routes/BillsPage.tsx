import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { HouseholdViewToggle } from "@/components/HouseholdViewToggle";
import { Fab } from "@/components/Fab";
import { RecurringBills } from "@/components/RecurringBills";
import { InstallmentPlans } from "@/components/InstallmentPlans";
import { useHouseholdView } from "@/context/HouseholdViewContext";
import { useMonth } from "@/context/MonthContext";
import { scopeFor } from "@/lib/scope";
import { cn } from "@/lib/utils";

const ABAS = [
  { key: "fixas", label: "Contas fixas" },
  { key: "parceladas", label: "Parcelamentos" },
] as const;

type Aba = (typeof ABAS)[number]["key"];

/** Os dois compromissos que se repetem, separados pela única diferença que
 *  importa: um tem fim, o outro não. Antes, parcelamento não tinha lugar — as
 *  parcelas viravam dezenas de linhas soltas em Transações, cada uma um pedaço
 *  de compra em vez de uma compra. */
export function BillsPage() {
  const { view, partner } = useHouseholdView();
  const scope = scopeFor(view, partner?.id ?? null);
  const month = useMonth();
  const [aba, setAba] = useState<Aba>("fixas");
  const [pedidoDeNovaConta, setPedidoDeNovaConta] = useState(0);

  return (
    <>
      <PageHeader
        title="Contas"
        subtitle={
          aba === "fixas" ? "Cobradas todo mês, sem data para acabar" : "Repetem todo mês, mas têm fim"
        }
        ctaLabel={aba === "fixas" ? "Nova conta" : undefined}
        onCta={aba === "fixas" ? () => setPedidoDeNovaConta((n) => n + 1) : undefined}
        aside={<HouseholdViewToggle />}
      />

      <div className="mb-4 flex w-fit gap-0.5 rounded-[10px] border border-divider bg-surface p-[3px]">
        {ABAS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setAba(opt.key)}
            className={cn(
              "whitespace-nowrap rounded-[10px] px-3.5 py-1.5 text-[13px] transition-colors",
              aba === opt.key ? "bg-track font-medium text-text" : "text-text-3 hover:text-text",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {aba === "fixas" ? (
        <RecurringBills scope={scope} month={month.key} abrirFormulario={pedidoDeNovaConta} />
      ) : (
        <InstallmentPlans scope={scope} />
      )}

      {aba === "fixas" && <Fab label="Nova conta" onClick={() => setPedidoDeNovaConta((n) => n + 1)} />}
    </>
  );
}
