import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHouseholdView, type HouseholdView } from "@/context/HouseholdViewContext";

/** Seletor de "de quem são os números". O app é de uso pessoal por padrão
 *  (Só eu); as outras opções servem para espiar a visão do parceiro ou o
 *  somatório do casal, sem misturar os lançamentos. */
export function HouseholdViewToggle() {
  const { view, setView, partner, hasHousehold } = useHouseholdView();

  if (!hasHousehold) {
    return (
      <Link
        to="/household"
        className="flex items-center gap-2 whitespace-nowrap rounded-[10px] border border-dashed border-divider-strong px-3 py-2 text-[12.5px] text-text-4 transition-colors hover:border-brand hover:text-brand"
      >
        <Users className="size-3.5" />
        Vincular parceiro(a)
      </Link>
    );
  }

  const firstName = partner?.name.split(" ")[0] ?? "Parceiro(a)";

  return (
    <Select value={view} onValueChange={(v) => setView(v as HouseholdView)}>
      <SelectTrigger className="h-auto w-auto gap-[7px] rounded-[10px] border-divider bg-surface px-3 py-2 text-[12.5px] text-text-2">
        <Users className="size-3.5 text-text-5" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="self">Só eu</SelectItem>
        <SelectItem value="partner">Só {firstName}</SelectItem>
        <SelectItem value="household">Casal (somado)</SelectItem>
      </SelectContent>
    </Select>
  );
}
