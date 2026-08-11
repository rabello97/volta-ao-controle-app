import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHouseholdView, type HouseholdView } from "@/context/HouseholdViewContext";
import { useAuth } from "@/context/AuthContext";

export function HouseholdViewToggle() {
  const { user } = useAuth();
  const { view, setView, partner, hasHousehold } = useHouseholdView();

  if (!hasHousehold) {
    return null;
  }

  return (
    <Tabs value={view} onValueChange={(value) => setView(value as HouseholdView)}>
      <TabsList>
        <TabsTrigger value="self">{user?.name?.split(" ")[0] ?? "Eu"}</TabsTrigger>
        <TabsTrigger value="partner">{partner?.name.split(" ")[0] ?? "Parceiro(a)"}</TabsTrigger>
        <TabsTrigger value="household">Unificado</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
