import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getHousehold } from "@/api/household";
import { useAuth } from "@/context/AuthContext";
import type { HouseholdMember } from "@/api/types";

export type HouseholdView = "self" | "partner" | "household";

export interface HouseholdViewContextValue {
  view: HouseholdView;
  setView: (view: HouseholdView) => void;
  partner: HouseholdMember | null;
  hasHousehold: boolean;
  isLoading: boolean;
}

const HouseholdViewContext = createContext<HouseholdViewContextValue | null>(null);

export function HouseholdViewProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const [view, setView] = useState<HouseholdView>("self");

  const { data, isLoading } = useQuery({
    queryKey: ["household"],
    queryFn: getHousehold,
    enabled: status === "authenticated",
  });

  const partner = useMemo(() => {
    const members = data?.members ?? [];
    if (members.length < 2) return null;
    return members.find((member) => member.id !== user?.id) ?? members[0];
  }, [data, user]);

  const hasHousehold = (data?.members.length ?? 0) >= 2;

  const value = useMemo<HouseholdViewContextValue>(
    () => ({
      view: hasHousehold ? view : "self",
      setView,
      partner,
      hasHousehold,
      isLoading,
    }),
    [view, partner, hasHousehold, isLoading],
  );

  return <HouseholdViewContext.Provider value={value}>{children}</HouseholdViewContext.Provider>;
}

export function useHouseholdView(): HouseholdViewContextValue {
  const ctx = useContext(HouseholdViewContext);
  if (!ctx) {
    throw new Error("useHouseholdView deve ser usado dentro de um HouseholdViewProvider");
  }
  return ctx;
}
