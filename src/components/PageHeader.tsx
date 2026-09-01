import { useState } from "react";
import { useMonth, monthLabel as formatMonth, shiftMonth } from "@/context/MonthContext";

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
  const month = useMonth();
  const [monthOpen, setMonthOpen] = useState(false);

  // Últimos 12 meses mais os 2 seguintes: cobre olhar para trás e planejar as
  // parcelas que já estão lançadas à frente.
  const opcoes = Array.from({ length: 15 }, (_, i) => shiftMonth(month.value, 2 - i));

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
          <div className="flex items-center gap-0.5 rounded-[10px] border border-divider bg-surface">
            <button
              type="button"
              onClick={() => month.shift(-1)}
              aria-label="Mês anterior"
              className="px-2 py-2 text-text-4 transition-colors hover:text-text"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M10 3 5 8l5 5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setMonthOpen((v) => !v)}
              className="whitespace-nowrap px-1 py-2 text-[12.5px] text-text-2 transition-colors hover:text-text"
            >
              {month.label}
            </button>
            <button
              type="button"
              onClick={() => month.shift(1)}
              aria-label="Próximo mês"
              className="px-2 py-2 text-text-4 transition-colors hover:text-text"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 3l5 5-5 5" />
              </svg>
            </button>
          </div>
          {monthOpen && (
            <>
              {/* Clicar fora fecha, sem precisar acertar o botão de novo. */}
              <button
                type="button"
                aria-label="Fechar seleção de mês"
                onClick={() => setMonthOpen(false)}
                className="fixed inset-0 z-10 cursor-default"
              />
              <div className="absolute right-0 top-full z-20 mt-1.5 max-h-[280px] w-[180px] overflow-y-auto rounded-[10px] border border-divider bg-surface p-1 shadow-[var(--shadow-card)]">
                {!month.isCurrent && (
                  <button
                    type="button"
                    onClick={() => {
                      month.reset();
                      setMonthOpen(false);
                    }}
                    className="mb-1 w-full rounded-lg bg-brand-tint px-2.5 py-1.5 text-left text-[12.5px] font-semibold text-brand"
                  >
                    Voltar para o mês atual
                  </button>
                )}
                {opcoes.map((opcao) => {
                  const ativo = opcao.year === month.value.year && opcao.month === month.value.month;
                  return (
                    <button
                      key={`${opcao.year}-${opcao.month}`}
                      type="button"
                      onClick={() => {
                        month.set(opcao);
                        setMonthOpen(false);
                      }}
                      className={
                        "w-full rounded-lg px-2.5 py-1.5 text-left text-[12.5px] transition-colors " +
                        (ativo ? "bg-track font-medium text-text" : "text-text-3 hover:text-text")
                      }
                    >
                      {formatMonth(opcao)}
                    </button>
                  );
                })}
              </div>
            </>
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
