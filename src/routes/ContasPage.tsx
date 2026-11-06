import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { SurfaceCard } from "@/components/SurfaceCard";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { Fab } from "@/components/Fab";
import { RecurringBillFormDialog } from "@/components/RecurringBillFormDialog";
import { useUpcomingDue } from "@/hooks/useUpcomingDue";
import { useCreateRecurringBill, usePayRecurringBill } from "@/hooks/useRecurringBills";
import { useHouseholdView } from "@/context/HouseholdViewContext";
import { useAuth } from "@/context/AuthContext";
import { useMonth } from "@/context/MonthContext";
import { agruparPorVencimento, rotuloDoTipo, totalAPagar, totalPago } from "@/lib/contas";
import { formatCurrency, formatMonthLabel, splitCurrency } from "@/lib/format";
import { plural } from "@/lib/plural";
import { cn } from "@/lib/utils";
import type { RecurringBillInput } from "@/api/recurringBills";
import type { UpcomingDueItem } from "@/api/types";

function iniciais(nome: string | null | undefined): string {
  if (!nome) return "?";
  return nome.trim().split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

function Linha({
  item,
  dono,
  mostrarDono,
  onPay,
  pagando,
}: {
  item: UpcomingDueItem;
  dono: string;
  mostrarDono: boolean;
  onPay?: () => void;
  pagando: boolean;
}) {
  const [, mes, dia] = item.dueDate.slice(0, 10).split("-").map(Number);
  const pago = item.status === "PAID";
  const atrasado = item.status === "OVERDUE";

  const conteudo = (
    <>
      <div
        className={cn(
          "flex w-[44px] flex-none flex-col items-center rounded-[11px] py-1.5",
          atrasado ? "bg-negative-tint" : "bg-surface-inset",
        )}
      >
        <span
          className={cn(
            "font-mono text-[16px] font-semibold leading-none tabular-nums",
            atrasado ? "text-negative" : "text-text",
          )}
        >
          {dia}
        </span>
        <span className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-text-5">
          {formatMonthLabel(mes)}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn("truncate text-[14.5px] font-medium", pago ? "text-text-4 line-through" : "text-text")}>
          {item.name}
        </span>
        <span className="truncate text-[12px] text-text-5">
          {rotuloDoTipo(item.kind)}
          {mostrarDono ? ` · ${dono}` : ""}
          {atrasado ? " · atrasada" : ""}
        </span>
      </div>

      <span
        className={cn(
          "flex-none whitespace-nowrap font-mono text-[15px] font-semibold tabular-nums",
          pago ? "text-text-4" : atrasado ? "text-negative" : "text-text",
        )}
      >
        {formatCurrency(item.amount)}
      </span>
    </>
  );

  return (
    <div className="flex items-center gap-3 border-t border-divider py-3 first:border-t-0 first:pt-0">
      {item.creditCardId ? (
        <Link
          to={`/credit-cards/${item.creditCardId}`}
          className="flex flex-1 items-center gap-3 rounded-[12px] transition-transform active:scale-[0.99]"
        >
          {conteudo}
        </Link>
      ) : (
        <div className="flex flex-1 items-center gap-3">{conteudo}</div>
      )}

      {/* No celular a ação vira um alvo redondo ao lado do valor. Antes ela
          quebrava para uma segunda linha e cada conta ocupava três linhas —
          numa tela de bater o olho, cabiam duas contas por vez. */}
      {onPay && !pago && (
        <button
          type="button"
          onClick={onPay}
          disabled={pagando}
          aria-label={`Marcar ${item.name} como paga`}
          className="flex size-9 flex-none items-center justify-center gap-1.5 rounded-full bg-brand-tint text-[12.5px] font-semibold text-brand transition-colors hover:bg-brand-tint-2 active:scale-[0.94] disabled:opacity-50 sm:size-auto sm:min-h-9 sm:px-3.5"
        >
          <CircleDashed className="size-4 sm:size-3.5" />
          <span className="hidden sm:inline">{pagando ? "…" : "Marcar paga"}</span>
        </button>
      )}
      {pago && (
        <span
          className="flex size-9 flex-none items-center justify-center gap-1.5 text-[12.5px] font-semibold text-positive sm:size-auto sm:px-1"
          title="Paga"
        >
          <CheckCircle2 className="size-4 sm:size-3.5" />
          <span className="hidden sm:inline">Paga</span>
        </span>
      )}
    </div>
  );
}

/** A tela de bater o olho: tudo que vai sair, de vocês dois, ordenado pelo que
 *  vence primeiro. Substituiu o painel como tela inicial porque o painel
 *  respondia "quanto sobra", pergunta que depende de renda lançada todo mês —
 *  e sem esse hábito ele mostrava número errado ou zerado. */
export function ContasPage() {
  const { user } = useAuth();
  const { partner } = useHouseholdView();
  const month = useMonth();
  const [formAberto, setFormAberto] = useState(false);

  // Sempre a visão do casal quando há parceiro: o pedido é ver as duas listas
  // de uma vez, não alternar entre elas.
  const scope = partner ? "household" : undefined;
  const { items, isLoading } = useUpcomingDue(scope, month.key);
  const pagar = usePayRecurringBill();
  const criar = useCreateRecurringBill();

  const grupos = agruparPorVencimento(items);
  const aPagar = totalAPagar(items);
  const pago = totalPago(items);
  const [reais, centavos] = splitCurrency(aPagar);
  const pendentes = items.filter((i) => i.status !== "PAID").length;

  const nomeDoDono = (ownerId: string) =>
    ownerId === user?.id ? iniciais(user?.name) : iniciais(partner?.name);

  async function handlePay(id: string) {
    try {
      await pagar.mutateAsync(id);
      toast.success("Conta marcada como paga.");
    } catch {
      toast.error("Não foi possível registrar o pagamento.");
    }
  }

  async function handleCriar(input: RecurringBillInput) {
    try {
      await criar.mutateAsync(input);
      setFormAberto(false);
    } catch {
      toast.error("Não foi possível salvar a conta.");
    }
  }

  return (
    <>
      <PageHeader
        title="Contas"
        subtitle={partner ? `Suas e de ${partner.name.split(" ")[0]}` : "Tudo que vence neste mês"}
        ctaLabel="Nova conta"
        onCta={() => setFormAberto(true)}
      />

      <div className="flex flex-col gap-3.5">
        {/* O número da pergunta: quanto ainda vai sair. */}
        <SurfaceCard>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-5">
            Ainda a pagar
          </span>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {isLoading ? (
              <Skeleton className="h-[38px] w-52" />
            ) : (
              <span className="font-mono text-[38px] font-semibold leading-none -tracking-[0.035em] tabular-nums text-text">
                {reais}
                <span className="text-[22px] text-text-4">{centavos}</span>
              </span>
            )}
            <span className="text-[12.5px] text-text-4">
              {plural(pendentes, "conta")} em aberto
              {pago > 0 ? ` · ${formatCurrency(pago)} já pago` : ""}
            </span>
          </div>
        </SurfaceCard>

        {isLoading && <Skeleton className="h-[220px] rounded-[20px]" />}

        {!isLoading && items.length === 0 && (
          <SurfaceCard>
            <EmptyState
              icon={CircleDashed}
              title="Nenhuma conta neste mês"
              description="Cadastre as contas fixas, os cartões e os gastos previstos para ver tudo aqui."
            />
          </SurfaceCard>
        )}

        {grupos.map((grupo) => (
          <SurfaceCard
            key={grupo.chave}
            title={grupo.titulo}
            action={
              <span className="font-mono text-[13px] font-semibold tabular-nums text-text-3">
                {formatCurrency(grupo.total)}
              </span>
            }
            className={grupo.chave === "pagas" ? "opacity-70" : undefined}
          >
            {grupo.itens.map((item) => (
              <Linha
                key={item.id}
                item={item}
                dono={nomeDoDono(item.ownerId)}
                mostrarDono={Boolean(partner)}
                onPay={item.recurringBillId ? () => handlePay(item.recurringBillId as string) : undefined}
                pagando={pagar.isPending && pagar.variables === item.recurringBillId}
              />
            ))}
          </SurfaceCard>
        ))}
      </div>

      <Fab label="Nova conta" onClick={() => setFormAberto(true)} />

      <RecurringBillFormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        onSubmit={handleCriar}
        isSubmitting={criar.isPending}
      />
    </>
  );
}
