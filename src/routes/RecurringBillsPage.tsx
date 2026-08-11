import { useState } from "react";
import { Plus, Repeat, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/EmptyState";
import { RecurringBillFormDialog } from "@/components/RecurringBillFormDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  useCreateRecurringBill,
  useDeleteRecurringBill,
  useRecurringBills,
  useUpdateRecurringBill,
} from "@/hooks/useRecurringBills";
import { formatCurrency } from "@/lib/format";
import type { RecurringBill } from "@/api/types";
import type { RecurringBillInput } from "@/api/recurringBills";

export function RecurringBillsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringBill | null>(null);
  const [deleting, setDeleting] = useState<RecurringBill | null>(null);

  const bills = useRecurringBills();
  const createMutation = useCreateRecurringBill();
  const updateMutation = useUpdateRecurringBill();
  const deleteMutation = useDeleteRecurringBill();

  async function handleSubmit(input: RecurringBillInput) {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input });
      } else {
        await createMutation.mutateAsync(input);
      }
      setFormOpen(false);
      setEditing(null);
    } catch {
      toast.error("Não foi possível salvar a conta recorrente.");
    }
  }

  async function handleToggleActive(bill: RecurringBill, active: boolean) {
    try {
      await updateMutation.mutateAsync({ id: bill.id, input: { active } });
    } catch {
      toast.error("Não foi possível atualizar a conta recorrente.");
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync(deleting.id);
      setDeleting(null);
    } catch {
      toast.error("Não foi possível excluir a conta recorrente.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-[22px] font-bold text-text">Contas recorrentes</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" /> Nova conta
        </Button>
      </div>

      {bills.data?.length === 0 && (
        <EmptyState
          icon={Repeat}
          title="Nenhuma conta recorrente"
          description="Cadastre água, luz, internet e outras contas fixas mensais."
          action={
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="size-4" /> Nova conta
            </Button>
          }
        />
      )}

      {bills.data && bills.data.length > 0 && (
        <ul className="flex flex-col gap-2">
          {bills.data.map((bill) => (
            <li key={bill.id} className="flex items-center justify-between gap-3 rounded-2xl bg-surface p-4 shadow-sm">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-text">{bill.name}</div>
                <div className="text-xs text-text-muted">
                  {bill.category} · vence dia {bill.dueDay}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-text">{formatCurrency(bill.expectedAmount)}</span>
                <Switch
                  checked={bill.active}
                  onCheckedChange={(checked) => handleToggleActive(bill, checked)}
                  aria-label="Ativa"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Editar"
                  onClick={() => {
                    setEditing(bill);
                    setFormOpen(true);
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" aria-label="Excluir" onClick={() => setDeleting(bill)}>
                  <Trash2 className="size-4 text-negative" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <RecurringBillFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        bill={editing}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir conta recorrente"
        description="Essa ação não pode ser desfeita."
        onConfirm={handleDelete}
      />
    </div>
  );
}
