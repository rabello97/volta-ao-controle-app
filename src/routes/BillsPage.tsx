import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { HouseholdViewToggle } from "@/components/HouseholdViewToggle";
import { Fab } from "@/components/Fab";
import { RecurringBills } from "@/components/RecurringBills";
import { InstallmentPlans } from "@/components/InstallmentPlans";
import { DebtPanel } from "@/components/DebtPanel";
import { useHouseholdView } from "@/context/HouseholdViewContext";
import { useMonth } from "@/context/MonthContext";
import { scopeFor } from "@/lib/scope";
import { cn } from "@/lib/utils";

const ABAS = [
  { key: "fixas", label: "Contas fixas" },
  { key: "parceladas", label: "Parcelamentos" },
  { key: "dividas", label: "Dívidas" },
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
          aba === "fixas"
            ? "Cobradas todo mês, sem data para acabar"
            : aba === "parceladas"
              ? "Repetem todo mês, mas têm fim"
              : "Tudo que ainda será cobrado, e quando acaba"
        }
        ctaLabel={aba === "fixas" ? "Nova conta" : undefined}
        onCta={aba === "fixas" ? () => setPedidoDeNovaConta((n) => n + 1) : undefined}
        aside={<HouseholdViewToggle />}
      />

      <div className="mb-4 flex w-fit gap-0.5 rounded-full bg-track p-[3px]">
        {ABAS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setAba(opt.key)}
            className={cn(
              "min-h-9 whitespace-nowrap rounded-full px-4 text-[13px] transition-colors sm:min-h-0 sm:py-1.5",
              aba === opt.key ? "bg-surface font-semibold text-text shadow-[var(--shadow-card)]" : "text-text-3 hover:text-text",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {aba === "dividas" ? (
        <DebtPanel scope={scope} monthKey={month.key} />
      ) : aba === "fixas" ? (
        <RecurringBills scope={scope} month={month.key} abrirFormulario={pedidoDeNovaConta} />
      ) : (
        <InstallmentPlans scope={scope} />
      )}

      {aba === "fixas" && <Fab label="Nova conta" onClick={() => setPedidoDeNovaConta((n) => n + 1)} />}
    </>
  );
}
