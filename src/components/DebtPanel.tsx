import { TrendingDown, Wallet, HandCoins } from "lucide-react";
import { StatTile } from "@/components/StatTile";
import { SpotCard } from "@/components/SpotCard";
import { SurfaceCard } from "@/components/SurfaceCard";
import { Skeleton } from "@/components/Skeleton";
import { useCreditCards } from "@/hooks/useCreditCards";
import { useInstallmentPlans } from "@/hooks/useInstallments";
import { useBudgetStatus } from "@/hooks/useBudget";
import { pesoMensal, proximoAlivio, totalDevido, trajetoria } from "@/lib/debt";
import { formatCurrency, formatMonthLabel } from "@/lib/format";
import { plural } from "@/lib/plural";
import { cn } from "@/lib/utils";

/** Painel de dívidas, fase 1: só o que já existe no banco, sem pedir taxa
 *  nenhuma. O herói é a TRAJETÓRIA, não o saldo — tela de dívida que abre com
 *  uma parede de vermelho é tela que ninguém abre duas vezes. */
export function DebtPanel({ scope, monthKey }: { scope?: string; monthKey: string }) {
  const cards = useCreditCards(scope);
  const plans = useInstallmentPlans(scope);
  const budget = useBudgetStatus(scope, monthKey);

  if (cards.isLoading || plans.isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[120px] rounded-[20px]" />
        ))}
      </div>
    );
  }

  const listaCards = cards.data ?? [];
  const listaPlanos = plans.data ?? [];
  const ativos = listaPlanos.filter((p) => !p.finished);

  const total = totalDevido(listaCards, listaPlanos);
  const peso = pesoMensal(listaPlanos);
  const pontos = trajetoria(listaPlanos, 12);
  const alivio = proximoAlivio(pontos);
  const emprestadoNoMes = budget.data?.borrowedIncome ?? 0;

  const maiorPeso = Math.max(1, ...pontos.map((p) => p.peso));
  const faturas = listaCards.reduce((s, c) => s + c.currentInvoiceTotal, 0);

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-12">
      <div className="sm:col-span-1 xl:col-span-4">
        <StatTile
          icon={Wallet}
          label="Devendo hoje"
          value={total}
          tone="negative"
          delta={{ label: `${formatCurrency(faturas)} em faturas`, tone: "quiet" }}
        />
      </div>
      <div className="sm:col-span-1 xl:col-span-4">
        <StatTile
          icon={TrendingDown}
          label="Parcelas por mês"
          value={peso}
          tone="warning"
          delta={{ label: `${plural(ativos.length, "compra")} em andamento`, tone: "quiet" }}
        />
      </div>
      <div className="sm:col-span-2 xl:col-span-4">
        <StatTile
          icon={HandCoins}
          label="Pego emprestado no mês"
          value={emprestadoNoMes}
          tone={emprestadoNoMes > 0 ? "negative" : "brand"}
          delta={
            emprestadoNoMes > 0
              ? { label: "vira dívida no mês que vem", tone: "up" }
              : { label: "nada emprestado", tone: "down" }
          }
        />
      </div>

      {/* O alívio é o herói: mostra que isto tem fim e quando. */}
      {alivio && (
        <SpotCard eyebrow="Próximo alívio" className="sm:col-span-2 xl:col-span-5">
          <p className="text-[15px] leading-[1.55] text-spot-fg">
            Em <b>{formatMonthLabel(alivio.month)} de {alivio.year}</b> o peso das parcelas cai{" "}
            <b className="font-mono text-spot-accent">{formatCurrency(alivio.queda)}</b> por mês.
          </p>
          {alivio.saindo.length > 0 && (
            <p className="text-[13px] leading-[1.5] text-spot-fg-2">
              {alivio.saindo.length === 1 ? "Sai da conta: " : "Saem da conta: "}
              {alivio.saindo.join(", ")}.
            </p>
          )}
          <p className="mt-auto text-[13px] text-spot-fg-2">
            De {formatCurrency(peso)} para {formatCurrency(peso - alivio.queda)} por mês.
          </p>
        </SpotCard>
      )}

      <SurfaceCard
        title="Peso das parcelas, mês a mês"
        className={cn("sm:col-span-2", alivio ? "xl:col-span-7" : "xl:col-span-12")}
      >
        {ativos.length === 0 ? (
          <p className="text-[13.5px] text-text-3">Nenhuma compra parcelada em andamento.</p>
        ) : (
          <>
            <div className="flex items-end gap-1.5" style={{ height: 150 }}>
              {pontos.map((p) => (
                <div key={`${p.year}-${p.month}`} className="flex flex-1 flex-col justify-end gap-1.5">
                  <div
                    title={`${formatMonthLabel(p.month)}/${p.year}: ${formatCurrency(p.peso)}`}
                    className={cn(
                      "w-full rounded-t-[4px]",
                      p.encerrando.length > 0 ? "bg-brand" : "bg-brand-tint-2",
                    )}
                    style={{ height: `${Math.max(2, (p.peso / maiorPeso) * 100)}%` }}
                  />
                  <span className="text-center text-[10.5px] text-text-5">{formatMonthLabel(p.month)}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12px] leading-[1.5] text-text-4">
              As barras destacadas são os meses em que alguma compra termina. Sem juros considerados — a fase 2
              acrescenta as taxas.
            </p>
          </>
        )}
      </SurfaceCard>

      {ativos.length > 0 && (
        <SurfaceCard title="Quando cada uma termina" className="sm:col-span-2 xl:col-span-12">
          <div className="flex flex-col">
            {[...ativos]
              .sort((a, b) => new Date(a.lastDate).getTime() - new Date(b.lastDate).getTime())
              .map((p) => {
                const fim = new Date(p.lastDate);
                return (
                  <div
                    key={p.groupId}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-divider py-3 first:border-t-0 first:pt-0"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium text-text">{p.description}</span>
                      <span className="text-[12px] text-text-5">
                        {p.paidCount} de {p.installmentTotal} pagas
                        {p.creditCardName ? ` · ${p.creditCardName}` : ""}
                      </span>
                    </div>
                    <span className="whitespace-nowrap font-mono text-[13.5px] text-text-3">
                      {formatCurrency(p.installmentAmount)}/mês
                    </span>
                    <span className="w-[92px] whitespace-nowrap text-right font-mono text-[13.5px] font-semibold text-text">
                      {formatCurrency(p.remainingTotal)}
                    </span>
                    <span className="w-[74px] whitespace-nowrap text-right text-[12.5px] text-text-4">
                      até {formatMonthLabel(fim.getUTCMonth() + 1)}/{String(fim.getUTCFullYear()).slice(2)}
                    </span>
                  </div>
                );
              })}
          </div>
        </SurfaceCard>
      )}
    </div>
  );
}
