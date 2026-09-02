import { formatCurrency } from "@/lib/format";
import { splitCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/Skeleton";
import { useBudgetStatus } from "@/hooks/useBudget";
import type { MonthValue } from "@/context/MonthContext";

interface MonthStatusCardProps {
  scope?: string;
  monthKey: string;
  month: MonthValue;
  isCurrent: boolean;
  onCadastrarRenda: () => void;
}

/** Quantos dias ainda restam no mês, contando hoje. Só faz sentido para o mês
 *  corrente — em mês passado não há o que planejar, e em mês futuro o mês
 *  inteiro está pela frente. */
function diasRestantes(month: MonthValue, isCurrent: boolean, hoje = new Date()): number {
  const ultimoDia = new Date(month.year, month.month, 0).getDate();
  if (!isCurrent) return ultimoDia;
  return Math.max(1, ultimoDia - hoje.getDate() + 1);
}

function percentualDoMesCorrido(month: MonthValue, isCurrent: boolean, hoje = new Date()): number {
  const ultimoDia = new Date(month.year, month.month, 0).getDate();
  if (!isCurrent) return 100;
  return Math.round((hoje.getDate() / ultimoDia) * 100);
}

/** O card que responde a pergunta que faz a pessoa abrir o app: "posso gastar?".
 *  Saldo acumulado não responde isso — sobra do mês, sim. */
export function MonthStatusCard({ scope, monthKey, month, isCurrent, onCadastrarRenda }: MonthStatusCardProps) {
  const status = useBudgetStatus(scope, monthKey);

  if (status.isLoading) {
    return (
      <section className="flex flex-col gap-3 overflow-hidden rounded-[18px] border border-hero-border bg-[image:var(--hero-grad)] px-5 py-5 sm:px-[26px]">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-[34px] w-56 sm:h-[46px] sm:w-72" />
        <Skeleton className="h-1.5 w-full" />
      </section>
    );
  }

  const data = status.data;
  if (!data) return null;

  const semRenda = data.income <= 0;
  const sobra = data.leftFromIncome;
  const noAzul = sobra >= 0;
  const [reais, centavos] = splitCurrency(Math.abs(sobra));
  const dias = diasRestantes(month, isCurrent);
  const porDia = noAzul ? sobra / dias : 0;
  const consumido = data.income > 0 ? Math.min(100, Math.round((data.spentFromAccount / data.income) * 100)) : 0;
  const corrido = percentualDoMesCorrido(month, isCurrent);

  return (
    <section className="flex flex-col gap-4 overflow-hidden rounded-[18px] border border-hero-border bg-[image:var(--hero-grad)] px-5 py-5 sm:px-[26px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-semibold tracking-[0.14em] text-text-4">
            {semRenda ? "GASTO DESTE MÊS" : noAzul ? "SOBRA DESTE MÊS" : "ESTOUROU ESTE MÊS"}
          </span>

          {semRenda ? (
            <span className="whitespace-nowrap font-mono text-[34px] font-medium leading-none -tracking-[0.035em] text-text sm:text-[46px]">
              {splitCurrency(data.spentFromAccount)[0]}
              <span className="text-text-4">{splitCurrency(data.spentFromAccount)[1]}</span>
            </span>
          ) : (
            <span
              className={cn(
                "whitespace-nowrap font-mono text-[34px] font-medium leading-none -tracking-[0.035em] sm:text-[46px]",
                noAzul ? "text-text" : "text-negative",
              )}
            >
              {noAzul ? "" : "−"}
              {reais}
              <span className={noAzul ? "text-text-4" : "text-negative/70"}>{centavos}</span>
            </span>
          )}

          {/* A frase transforma o número em decisão: sem ela, é só mais um saldo. */}
          {semRenda ? (
            <button
              type="button"
              onClick={onCadastrarRenda}
              className="self-start rounded-[10px] border border-dashed border-divider-strong px-3 py-2 text-left text-[12px] text-text-3 transition-colors hover:border-brand hover:text-text"
            >
              Cadastre sua renda mensal para o app dizer se dá para gastar
            </button>
          ) : noAzul ? (
            <span className="text-[13px] text-text-3">
              Dá para gastar <strong className="font-semibold text-text">{formatCurrency(porDia)} por dia</strong>
              {isCurrent ? ` nos ${dias} dias que faltam` : " ao longo do mês"}
            </span>
          ) : (
            <span className="text-[13px] text-negative">
              As saídas passaram a renda em {formatCurrency(Math.abs(sobra))} neste mês
            </span>
          )}
        </div>

        {!semRenda && (
          <div className="flex flex-none flex-row flex-wrap items-baseline gap-x-2 gap-y-1 sm:flex-col sm:items-end">
            <span className="text-[11px] uppercase tracking-[0.12em] text-text-4">Renda</span>
            <span className="font-mono text-[15px] text-text">{formatCurrency(data.income)}</span>
            {data.benefitIncome > 0 && (
              <span className="text-[11px] text-text-4">+ {formatCurrency(data.benefitIncome)} em benefícios</span>
            )}
          </div>
        )}
      </div>

      {!semRenda && (
        <div className="flex flex-col gap-1.5">
          <div className="relative h-1.5 overflow-hidden rounded-[4px] bg-track">
            <div
              className={cn("h-full rounded-[4px]", consumido >= 100 ? "bg-negative" : consumido >= 80 ? "bg-warning" : "bg-brand")}
              style={{ width: `${consumido}%` }}
            />
            {/* Marca de quanto do mês já passou: gastar 60% da renda no dia 10 é
                diferente de gastar 60% no dia 28. */}
            {isCurrent && (
              <span
                className="absolute top-0 h-full w-px bg-text-4"
                style={{ left: `${corrido}%` }}
                aria-hidden="true"
              />
            )}
          </div>
          <div className="flex flex-wrap justify-between gap-2 text-[11px] text-text-4">
            <span>
              {formatCurrency(data.spentFromAccount)} saíram da conta · {consumido}% da renda
            </span>
            {isCurrent && <span>{corrido}% do mês corrido</span>}
          </div>
        </div>
      )}
    </section>
  );
}
