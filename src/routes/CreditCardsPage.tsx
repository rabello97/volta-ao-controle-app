import { useState } from "react";
import { Plus, CreditCard as CreditCardIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { CardTile } from "@/components/CardTile";
import { CreditCardFormDialog } from "@/components/CreditCardFormDialog";
import { useCreateCreditCard, useCreditCards } from "@/hooks/useCreditCards";
import type { CreditCardInput } from "@/api/creditCards";

export function CreditCardsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const { data: cards, isLoading } = useCreditCards();
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

      {!isLoading && cards?.length === 0 && (
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

      {cards && cards.length > 0 && (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <CardTile key={card.id} card={card} />
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
