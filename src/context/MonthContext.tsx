import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export interface MonthValue {
  year: number;
  month: number;
}

export interface MonthContextValue {
  /** Mês selecionado, no formato que a API espera: "AAAA-MM". */
  key: string;
  value: MonthValue;
  label: string;
  isCurrent: boolean;
  set: (value: MonthValue) => void;
  shift: (months: number) => void;
  reset: () => void;
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function monthKey({ year, month }: MonthValue): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function monthLabel({ year, month }: MonthValue): string {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function currentMonth(now: Date = new Date()): MonthValue {
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/** Soma meses cuidando da virada de ano. */
export function shiftMonth({ year, month }: MonthValue, delta: number): MonthValue {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

/** Primeiro e último dia do mês, em AAAA-MM-DD, para filtrar transações. */
export function monthRange({ year, month }: MonthValue): { from: string; to: string } {
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  return { from: `${year}-${pad(month)}-01`, to: `${year}-${pad(month)}-${pad(last)}` };
}

const MonthContext = createContext<MonthContextValue | null>(null);

export function MonthProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<MonthValue>(() => currentMonth());

  const contextValue = useMemo<MonthContextValue>(() => {
    const atual = currentMonth();
    return {
      key: monthKey(value),
      value,
      label: monthLabel(value),
      isCurrent: value.year === atual.year && value.month === atual.month,
      set: setValue,
      shift: (months: number) => setValue((atual2) => shiftMonth(atual2, months)),
      reset: () => setValue(currentMonth()),
    };
  }, [value]);

  return <MonthContext.Provider value={contextValue}>{children}</MonthContext.Provider>;
}

export function useMonth(): MonthContextValue {
  const ctx = useContext(MonthContext);
  if (!ctx) {
    throw new Error("useMonth deve ser usado dentro de um MonthProvider");
  }
  return ctx;
}
