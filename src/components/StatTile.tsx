import type { LucideIcon } from "lucide-react";
import { splitCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type Tone = "brand" | "negative" | "warning" | "info";
type DeltaTone = "up" | "down" | "quiet";

interface StatTileProps {
  icon: LucideIcon;
  label: string;
  /** Número em dinheiro (parte inteira grande, centavos rebaixados) ou texto
   *  já pronto quando o valor não é moeda (ex.: "4 planos"). */
  value: number | string;
  tone?: Tone;
  /** Chip do rodapé: variação, contagem ou observação curta. */
  delta?: { label: string; tone?: DeltaTone };
  /** Barrinhas à direita do rodapé — a mesma série que o número resume. */
  bars?: number[];
  className?: string;
}

const ICON_TONE: Record<Tone, string> = {
  brand: "bg-brand-tint text-brand",
  negative: "bg-negative-tint text-negative",
  warning: "bg-warning-tint text-warning",
  info: "bg-info-tint text-info",
};

const DELTA_TONE: Record<DeltaTone, string> = {
  up: "bg-negative-tint text-negative",
  down: "bg-positive-tint text-positive",
  quiet: "bg-track text-text-4",
};

export function StatTile({ icon: Icon, label, value, tone = "brand", delta, bars, className }: StatTileProps) {
  const [inteiro, centavos] = typeof value === "number" ? splitCurrency(value) : [value, ""];
  const maior = bars && bars.length > 0 ? Math.max(...bars) : 0;

  return (
    <div
      className={cn(
        "flex h-full flex-col gap-2.5 rounded-[20px] bg-surface p-4 shadow-[var(--shadow-soft)] sm:gap-3 sm:px-[18px] sm:py-[17px]",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn("flex size-[30px] flex-none items-center justify-center rounded-[9px]", ICON_TONE[tone])}>
          <Icon className="size-4" strokeWidth={2} />
        </span>
        <span className="min-w-0 text-[12px] font-medium leading-tight text-text-4 sm:text-[12.5px]">{label}</span>
      </div>

      <div className="font-mono text-[19px] font-semibold leading-none -tracking-[0.03em] tabular-nums text-text sm:text-[25px]">
        {inteiro}
        {centavos && <span className="text-[13px] font-medium text-text-4 sm:text-[15px]">{centavos}</span>}
      </div>

      {(delta || bars) && (
        <div className="flex flex-wrap items-end gap-2">
          {delta && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11.5px] font-semibold leading-tight sm:text-[12px]",
                DELTA_TONE[delta.tone ?? "quiet"],
              )}
            >
              {delta.label}
            </span>
          )}
          {bars && bars.length > 0 && maior > 0 && (
            <div className="ml-auto flex h-6 flex-none items-end gap-[2.5px]" aria-hidden="true">
              {bars.map((valor, i) => (
                <span
                  key={i}
                  className={cn(
                    "w-[5px] rounded-[1.5px]",
                    i === bars.length - 1 ? "bg-brand" : "bg-brand-tint-2",
                  )}
                  style={{ height: `${Math.max(8, (valor / maior) * 100)}%` }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
