import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { CardTile } from "@/components/CardTile";
import { CreditCardFormDialog } from "@/components/CreditCardFormDialog";
import { useCreateCreditCard, useCreditCards, useDeleteCreditCard, useUpdateCreditCard } from "@/hooks/useCreditCards";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { formatCurrency } from "@/lib/format";
import { plural } from "@/lib/plural";
import { scopeFor } from "@/lib/scope";
import { useHouseholdView } from "@/context/HouseholdViewContext";
import { HouseholdViewToggle } from "@/components/HouseholdViewToggle";
import { Skeleton } from "@/components/Skeleton";
import { ErrorState } from "@/components/ErrorState";
import type { CreditCardInput } from "@/api/creditCards";
import type { CreditCardSummary } from "@/api/types";

export function CreditCardsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CreditCardSummary | null>(null);
  const [deleting, setDeleting] = useState<CreditCardSummary | null>(null);
  const { view, partner } = useHouseholdView();
  const scope = scopeFor(view, partner?.id ?? null);
  const readOnly = scope !== undefined;

  const { data: cards, isLoading, isError, refetch } = useCreditCards(scope);
  const createMutation = useCreateCreditCard();
  const updateMutation = useUpdateCreditCard();
  const deleteMutation = useDeleteCreditCard();

  const openTotal = (cards ?? []).reduce((sum, c) => sum + c.currentInvoiceTotal, 0);

  async function handleSubmit(input: CreditCardInput) {
    try {
      if (editing) await updateMutation.mutateAsync({ id: editing.id, input });
      else await createMutation.mutateAsync(input);
      setFormOpen(false);
      setEditing(null);
    } catch {
      toast.error("Não foi possível salvar o cartão.");
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync(deleting.id);
      setDeleting(null);
    } catch {
      toast.error("Não foi possível excluir o cartão.");
    }
  }

  return (
    <>
      <PageHeader
        title="Cartões"
        subtitle={`${plural(cards?.length ?? 0, "cartão", "cartões")} · ${formatCurrency(openTotal)} em faturas abertas`}
        ctaLabel={readOnly ? undefined : "Novo cartão"}
        onCta={
          readOnly
            ? undefined
            : () => {
                setEditing(null);
                setFormOpen(true);
              }
        }
        aside={<HouseholdViewToggle />}
      />

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isError && (
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          [0, 1].map((i) => (
            <div key={i} className="flex min-h-[168px] flex-col gap-6 rounded-[18px] border border-divider bg-surface p-5">
              <Skeleton className="h-4 w-32" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-2.5 w-24" />
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-[5px] w-full rounded-full" />
              </div>
            </div>
          ))}

        {cards?.map((card, index) => (
          <div key={card.id} className="relative">
            <CardTile card={card} highlight={index === 0} />
            {/* Antes não havia como corrigir apelido, fechamento, vencimento ou
                limite depois de cadastrar — só criar. */}
            {!readOnly && (
              // Canto inferior: o topo já é do selo "fecha em Xd".
              <div className="absolute bottom-3 right-3 flex gap-0.5">
                <button
                  type="button"
                  aria-label={`Editar ${card.nickname}`}
                  onClick={() => {
                    setEditing(card);
                    setFormOpen(true);
                  }}
                  className="flex size-11 flex-none items-center justify-center rounded-[10px] transition-colors md:size-9 text-text-5 hover:bg-surface-2 hover:text-text"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label={`Excluir ${card.nickname}`}
                  onClick={() => setDeleting(card)}
                  className="flex size-11 flex-none items-center justify-center rounded-[10px] transition-colors md:size-9 text-text-5 hover:bg-negative-tint hover:text-negative"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}

        {!readOnly && (
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="flex min-h-[168px] flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed border-divider-strong p-5 transition-colors hover:border-brand hover:bg-surface-2"
        >
          <div className="flex size-[38px] items-center justify-center rounded-xl bg-brand-tint text-brand">
            <Plus className="size-4" />
          </div>
          <span className="text-[13px] font-semibold text-text">Adicionar cartão</span>
          <span className="max-w-[220px] text-center text-[12px] leading-[1.5] text-text-4">
            Vincule transações e acompanhe a fatura fechando em tempo real.
          </span>
        </button>
        )}
      </div>
      )}

      <CreditCardFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        card={editing}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir cartão"
        description="As transações lançadas nele continuam no histórico, mas deixam de ter cartão e fatura."
        onConfirm={handleDelete}
      />
    </>
  );
}
