import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, CreditCard as CreditCardIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { CreditCardFormDialog } from "@/components/CreditCardFormDialog";
import { useCreateCreditCard, useCreditCardsWithCurrentInvoice } from "@/hooks/useCreditCards";
import { formatCurrency } from "@/lib/format";
import type { CreditCardInput } from "@/api/creditCards";

export function CreditCardsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const { cards, isLoading } = useCreditCardsWithCurrentInvoice();
  const createMutation = useCreateCreditCard();

  async function handleSubmit(input: CreditCardInput) {
    try {
      await createMutation.mutateAsync(input);
      setFormOpen(false);
    } catch {
      toast.error("Não foi possível cadastrar o cartão.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-[22px] font-bold text-text">Cartões</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4" /> Novo cartão
        </Button>
      </div>

      {!isLoading && cards.length === 0 && (
        <EmptyState
          icon={CreditCardIcon}
          title="Nenhum cartão cadastrado"
          description="Cadastre um cartão para vincular transações e acompanhar a fatura."
          action={
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="size-4" /> Novo cartão
            </Button>
          }
        />
      )}

      {cards.length > 0 && (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.id}
              to={`/credit-cards/${card.id}`}
              className="flex flex-col gap-1 rounded-2xl bg-surface p-4.5 shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <span className="font-heading text-base font-extrabold text-text">{card.nickname}</span>
              <span className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                Fatura atual
              </span>
              <span className="font-heading text-xl font-extrabold text-negative">
                {card.currentInvoiceTotal !== null ? formatCurrency(card.currentInvoiceTotal) : "—"}
              </span>
              <span className="mt-2 text-xs text-text-faint">
                Fecha dia {card.closingDay} · vence dia {card.dueDay}
              </span>
            </Link>
          ))}
        </div>
      )}

      <CreditCardFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
