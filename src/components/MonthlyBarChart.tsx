import { useState } from "react";
import { formatCurrency, formatMonthLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MonthlyTotal } from "@/lib/monthlyEvolution";

const PLOT_HEIGHT = 168;
/** Coluna fina: a barra nunca preenche a faixa do mês, a sobra vira ar. */
const BAR_WIDTH = 13;
/** Valor diferente de zero sempre aparece, mesmo minúsculo perto do maior mês. */
const MIN_BAR = 2;

/** Arredonda o topo da escala para 1, 2 ou 5 × 10^n, para os rótulos do eixo
 *  caírem em números redondos em vez do valor cru do maior mês. */
function niceMax(value: number): number {
  if (value <= 0) return 1;
  const exp = Math.floor(Math.log10(value));
  const base = 10 ** exp;
  const norm = value / base;
  const passo = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return passo * base;
}

function tickLabel(value: number): string {
  if (value >= 1000) return `${(value / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k`;
  return value.toLocaleString("pt-BR");
}

export function MonthlyBarChart({ data }: { data: MonthlyTotal[] }) {
  const [ativo, setAtivo] = useState<number | null>(null);

  const max = niceMax(Math.max(1, ...data.map((d) => Math.max(d.income, d.expense))));
  const ticks = [0, max / 2, max];

  // Rótulo direto só no mês de maior entrada — um número em cima de cada barra
  // vira ruído e ninguém lê.
  const destaque = data.reduce((melhor, item, i) => (item.income > data[melhor].income ? i : melhor), 0);

  const altura = (valor: number) => (valor <= 0 ? 0 : Math.max(MIN_BAR, Math.round((valor / max) * PLOT_HEIGHT)));

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-4 text-[12px] text-text-3">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-positive" /> Entradas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-negative" /> Saídas
        </span>
      </div>

      <div className="relative pl-11">
        {/* Grade: filete sólido, um passo acima da superfície, atrás dos dados. */}
        <div className="pointer-events-none absolute inset-x-0 left-11 top-0" style={{ height: PLOT_HEIGHT }}>
          {ticks.map((t) => (
            <div
              key={t}
              className="absolute inset-x-0 border-t border-divider"
              style={{ bottom: `${(t / max) * PLOT_HEIGHT}px` }}
            >
              <span className="absolute -left-11 -top-2 w-9 text-right font-mono text-[10.5px] tabular-nums text-text-5">
                {tickLabel(t)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-end gap-1.5" style={{ height: PLOT_HEIGHT }}>
          {data.map((item, index) => {
            const sobra = item.income - item.expense;
            const emFoco = ativo === index;
            return (
              <div
                key={`${item.year}-${item.month}`}
                onMouseEnter={() => setAtivo(index)}
                onMouseLeave={() => setAtivo(null)}
                onFocus={() => setAtivo(index)}
                onBlur={() => setAtivo(null)}
                tabIndex={0}
                className="group relative flex h-full flex-1 items-end justify-center rounded-t-[6px] outline-none transition-colors hover:bg-surface-inset focus-visible:bg-surface-inset"
              >
                {/* Rótulo direto: só o mês de maior entrada, ou o mês sob o cursor. */}
                {(index === destaque || emFoco) && (
                  <span
                    className="pointer-events-none absolute z-10 whitespace-nowrap rounded-full bg-surface px-2 py-0.5 font-mono text-[10.5px] font-semibold tabular-nums text-text shadow-[var(--shadow-card)]"
                    style={{ bottom: `${Math.max(altura(item.income), altura(item.expense)) + 6}px` }}
                  >
                    {sobra >= 0 ? "+" : "−"}
                    {formatCurrency(Math.abs(sobra))}
                  </span>
                )}

                {/* gap-[2px] na superfície separa as duas barras — sem contorno. */}
                <div className="flex items-end gap-[2px]">
                  <div
                    className={cn("rounded-t-[4px] bg-positive transition-opacity", ativo !== null && !emFoco && "opacity-45")}
                    style={{ width: BAR_WIDTH, height: altura(item.income) }}
                  />
                  <div
                    className={cn("rounded-t-[4px] bg-negative transition-opacity", ativo !== null && !emFoco && "opacity-45")}
                    style={{ width: BAR_WIDTH, height: altura(item.expense) }}
                  />
                </div>

                {emFoco && (
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-8 w-max -translate-x-1/2 rounded-[12px] border border-divider bg-surface px-3 py-2 shadow-[var(--shadow-lift)]">
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-5">
                      {formatMonthLabel(item.month)}/{item.year}
                    </div>
                    <div className="flex items-center gap-2 text-[12px]">
                      <span className="size-2 rounded-full bg-positive" />
                      <span className="text-text-3">Entradas</span>
                      <span className="ml-auto font-mono tabular-nums text-text">{formatCurrency(item.income)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px]">
                      <span className="size-2 rounded-full bg-negative" />
                      <span className="text-text-3">Saídas</span>
                      <span className="ml-auto font-mono tabular-nums text-text">{formatCurrency(item.expense)}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 border-t border-divider pt-1 text-[12px]">
                      <span className="text-text-3">Sobrou</span>
                      <span
                        className={cn(
                          "ml-auto font-mono font-semibold tabular-nums",
                          sobra >= 0 ? "text-positive" : "text-negative",
                        )}
                      >
                        {sobra >= 0 ? "+" : "−"}
                        {formatCurrency(Math.abs(sobra))}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-2 flex gap-1.5">
          {data.map((item) => (
            <span key={`${item.year}-${item.month}`} className="flex-1 text-center text-[11.5px] text-text-4">
              {formatMonthLabel(item.month)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
