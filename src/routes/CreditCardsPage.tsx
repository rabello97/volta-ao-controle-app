import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { CardTile } from "@/components/CardTile";
import { CreditCardFormDialog } from "@/components/CreditCardFormDialog";
import { useCreateCreditCard, useCreditCards } from "@/hooks/useCreditCards";
import { formatCurrency } from "@/lib/format";
import type { CreditCardInput } from "@/api/creditCards";

export function CreditCardsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const { data: cards } = useCreditCards();
  const createMutation = useCreateCreditCard();

  const openTotal = (cards ?? []).reduce((sum, c) => sum + c.currentInvoiceTotal, 0);

  async function handleSubmit(input: CreditCardInput) {
    try {
      await createMutation.mutateAsync(input);
      setFormOpen(false);
    } catch {
      toast.error("Não foi possível cadastrar o cartão.");
    }
  }

  return (
    <>
      <PageHeader
        title="Cartões"
        subtitle={`${cards?.length ?? 0} cartões · ${formatCurrency(openTotal)} em faturas abertas`}
        ctaLabel="Novo cartão"
        onCta={() => setFormOpen(true)}
      />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {cards?.map((card, index) => (
          <CardTile key={card.id} card={card} highlight={index === 0} />
        ))}

        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="flex min-h-[168px] flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed border-divider-strong p-5 transition-colors hover:border-brand hover:bg-surface-2"
        >
          <div className="flex size-[38px] items-center justify-center rounded-xl bg-brand-tint text-brand">
            <Plus className="size-4" />
          </div>
          <span className="text-[13.5px] font-semibold text-text">Adicionar cartão</span>
          <span className="max-w-[220px] text-center text-[11.5px] leading-[1.5] text-text-4">
            Vincule transações e acompanhe a fatura fechando em tempo real.
          </span>
        </button>
      </div>

      <CreditCardFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
      />
    </>
  );
}
