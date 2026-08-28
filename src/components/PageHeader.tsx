import { useState } from "react";
import { formatMonthLabel } from "@/lib/format";

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

interface PageHeaderProps {
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onCta?: () => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  /** Slot extra à esquerda das ações (ex.: alternador de visão do household). */
  aside?: React.ReactNode;
}

/** Cabeçalho comum a todas as telas (título + subtítulo à esquerda, busca /
 *  seletor de mês / ação principal à direita), como no mockup aprovado. */
export function PageHeader({ title, subtitle, ctaLabel, onCta, search, onSearchChange, aside }: PageHeaderProps) {
  const now = new Date();
  const [monthOpen, setMonthOpen] = useState(false);
  const monthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <header className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex flex-col gap-[3px]">
        <h1 className="text-[21px] font-semibold -tracking-[0.02em] text-text sm:text-[23px]">{title}</h1>
        <span className="text-[12.5px] text-text-4">{subtitle}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:ml-auto sm:flex-none sm:gap-2.5">
        {aside}
        {onSearchChange !== undefined && (
          <label className="order-last flex w-full items-center gap-2 rounded-[10px] border border-divider bg-surface px-3 py-2 text-[12.5px] text-text-4 focus-within:border-divider-strong sm:order-none sm:w-[200px]">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-none">
              <circle cx="7" cy="7" r="4.6" />
              <path d="M10.5 10.5 14 14" />
            </svg>
            <input
              value={search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar"
              className="w-full bg-transparent text-text outline-none placeholder:text-text-4"
            />
          </label>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => setMonthOpen((v) => !v)}
            className="flex items-center gap-2 whitespace-nowrap rounded-[10px] border border-divider bg-surface px-3 py-2 text-[12.5px] text-text-2 transition-colors hover:border-divider-strong"
          >
            {monthLabel}
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-text-5">
              <path d="M4 6.5 8 10.5l4-4" />
            </svg>
          </button>
          {monthOpen && (
            <div className="absolute right-0 top-full z-20 mt-1.5 rounded-[10px] border border-divider bg-surface p-2 text-[12.5px] text-text-3 shadow-[var(--shadow-card)]">
              Apenas o mês atual ({formatMonthLabel(now.getMonth() + 1)}) por enquanto.
            </div>
          )}
        </div>

        {ctaLabel && onCta && (
          <button
            type="button"
            onClick={onCta}
            className="flex flex-1 items-center justify-center gap-[7px] whitespace-nowrap rounded-[10px] bg-brand px-[15px] py-[9px] text-[12.5px] font-semibold text-brand-ink transition-all hover:bg-brand-hover active:scale-95 sm:flex-none"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M8 3v10M3 8h10" />
            </svg>
            {ctaLabel}
          </button>
        )}
      </div>
    </header>
  );
}
