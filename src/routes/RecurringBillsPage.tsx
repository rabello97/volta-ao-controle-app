import { useState } from "react";
import { Plus, Repeat, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/EmptyState";
import { MoneyValue } from "@/components/MoneyValue";
import { StatusPill } from "@/components/StatusPill";
import { RecurringBillFormDialog } from "@/components/RecurringBillFormDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  useCreateRecurringBill,
  useDeleteRecurringBill,
  usePayRecurringBill,
  useRecurringBillStats,
  useRecurringBillsWithStatus,
  useUpdateRecurringBill,
} from "@/hooks/useRecurringBills";
import { cn } from "@/lib/utils";
import type { RecurringBillWithStatus } from "@/api/types";
import type { RecurringBillInput } from "@/api/recurringBills";

export function RecurringBillsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringBillWithStatus | null>(null);
  const [deleting, setDeleting] = useState<RecurringBillWithStatus | null>(null);

  const bills = useRecurringBillsWithStatus();
  const stats = useRecurringBillStats();
  const createMutation = useCreateRecurringBill();
  const updateMutation = useUpdateRecurringBill();
  const deleteMutation = useDeleteRecurringBill();
  const payMutation = usePayRecurringBill();

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

  async function handleToggleActive(id: string, active: boolean) {
    try {
      await updateMutation.mutateAsync({ id, input: { active } });
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

  async function handlePay(id: string) {
    try {
      await payMutation.mutateAsync(id);
      toast.success("Conta marcada como paga.");
    } catch {
      toast.error("Não foi possível registrar o pagamento.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-[22px] font-semibold text-text">Contas recorrentes</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" /> Nova conta
        </Button>
      </div>

      {stats.data && (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <div className="rounded-2xl border border-divider bg-surface p-4.5 shadow-[var(--shadow-card)]">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-text-4">Custo fixo mensal</span>
            <div className="mt-1">
              <MoneyValue value={stats.data.fixedMonthlyCost} className="text-xl font-semibold" />
            </div>
          </div>
          <div className="rounded-2xl border border-divider bg-surface p-4.5 shadow-[var(--shadow-card)]">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-text-4">Pagas neste mês</span>
            <div className="mt-1 font-mono text-xl font-semibold text-text">
              {stats.data.paidCount} de {stats.data.totalActive}
            </div>
          </div>
          <div className="rounded-2xl border border-divider bg-surface p-4.5 shadow-[var(--shadow-card)]">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-text-4">Próxima a vencer</span>
            <div className="mt-1 text-[15px] font-semibold text-text">
              {stats.data.nextDue ? `${stats.data.nextDue.name} · dia ${stats.data.nextDue.dueDay}` : "—"}
            </div>
          </div>
        </div>
      )}

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
        <div className="rounded-2xl border border-divider bg-surface p-2 shadow-[var(--shadow-card)]">
          <ul className="flex flex-col">
            {bills.data.map((bill) => {
              const ratio = bill.averageLast3Months > 0 ? bill.expectedAmount / bill.averageLast3Months : 1;
              const barPct = Math.min(100, Math.max(8, Math.round(ratio * 50)));
              return (
                <li key={bill.id} className="flex items-center justify-between gap-3 rounded-xl px-3 py-3.5">
                  <div className="w-14 flex-none">
                    <div className="font-mono text-sm font-semibold text-text">{bill.dueDay}</div>
                    <div className="text-[10px] uppercase text-text-4">dia</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-text">{bill.name}</div>
                    <div className="truncate text-xs text-text-4">{bill.category}</div>
                  </div>
                  <div className="hidden w-32 flex-none sm:block">
                    <div className="mb-1 text-[10px] uppercase text-text-4">Variação vs. média</div>
                    <div className="h-1 overflow-hidden rounded-full bg-track">
                      <div
                        className={cn("h-full rounded-full", ratio > 1.05 ? "bg-negative" : "bg-positive")}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </div>
                  <Switch
                    checked={bill.active}
                    onCheckedChange={(checked) => handleToggleActive(bill.id, checked)}
                    aria-label="Ativa"
                  />
                  {bill.paidThisMonth ? (
                    <StatusPill label="Pago" tone="positive" />
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => handlePay(bill.id)} disabled={payMutation.isPending}>
                      Pagar
                    </Button>
                  )}
                  <MoneyValue value={bill.expectedAmount} className="w-24 flex-none text-right font-semibold" />
                  <div className="flex flex-none items-center gap-1">
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
              );
            })}
          </ul>
        </div>
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
