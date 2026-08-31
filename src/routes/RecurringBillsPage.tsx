import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { RecurringBillFormDialog } from "@/components/RecurringBillFormDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Switch } from "@/components/ui/switch";
import {
  useCreateRecurringBill,
  useDeleteRecurringBill,
  usePayRecurringBill,
  useRecurringBillStats,
  useRecurringBillsWithStatus,
  useUpdateRecurringBill,
} from "@/hooks/useRecurringBills";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { scopeFor } from "@/lib/scope";
import { useHouseholdView } from "@/context/HouseholdViewContext";
import { HouseholdViewToggle } from "@/components/HouseholdViewToggle";
import { Skeleton } from "@/components/Skeleton";
import { ErrorState } from "@/components/ErrorState";
import type { RecurringBillWithStatus } from "@/api/types";
import type { RecurringBillInput } from "@/api/recurringBills";

const ROW = "md:grid-cols-[56px_1fr_150px_110px_120px_110px]";

function KpiCard({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-[5px] rounded-2xl border border-divider bg-surface px-[18px] py-4 shadow-[var(--shadow-card)]">
      <span className="text-[10.5px] font-semibold tracking-[0.13em] text-text-4">{label}</span>
      <span
        className={cn(
          "font-mono text-[22px] font-medium -tracking-[0.02em]",
          accent ? "text-brand" : "text-text",
        )}
      >
        {value}
      </span>
      {hint && <span className="text-[11.5px] text-text-4">{hint}</span>}
    </div>
  );
}

export function RecurringBillsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringBillWithStatus | null>(null);
  const [deleting, setDeleting] = useState<RecurringBillWithStatus | null>(null);

  const { view, partner } = useHouseholdView();
  const scope = scopeFor(view, partner?.id ?? null);
  const readOnly = scope !== undefined;

  const bills = useRecurringBillsWithStatus(scope);
  const stats = useRecurringBillStats(scope);
  const createMutation = useCreateRecurringBill();
  const updateMutation = useUpdateRecurringBill();
  const deleteMutation = useDeleteRecurringBill();
  const payMutation = usePayRecurringBill();

  const pendingTotal = (bills.data ?? [])
    .filter((b) => b.active && !b.paidThisMonth)
    .reduce((sum, b) => sum + b.expectedAmount, 0);

  async function handleSubmit(input: RecurringBillInput) {
    try {
      if (editing) await updateMutation.mutateAsync({ id: editing.id, input });
      else await createMutation.mutateAsync(input);
      setFormOpen(false);
      setEditing(null);
    } catch {
      toast.error("Não foi possível salvar a conta recorrente.");
    }
  }

  async function handleToggle(id: string, active: boolean) {
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
    <>
      <PageHeader
        title="Contas recorrentes"
        subtitle={
          stats.data
            ? `${stats.data.totalActive} contas fixas · ${formatCurrency(stats.data.fixedMonthlyCost)} por mês`
            : "Contas fixas mensais"
        }
        ctaLabel={readOnly ? undefined : "Nova conta"}
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

      <div className="flex flex-col gap-4">
        {bills.isError && <ErrorState onRetry={() => bills.refetch()} />}

        {!bills.isError && stats.isLoading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-col gap-2 rounded-2xl border border-divider bg-surface px-[18px] py-4 shadow-[var(--shadow-card)]",
                  i === 2 && "col-span-2 sm:col-span-1",
                )}
              >
                <Skeleton className="h-2.5 w-28" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-2.5 w-24" />
              </div>
            ))}
          </div>
        )}

        {!bills.isError && stats.data && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <KpiCard label="CUSTO FIXO MENSAL" value={formatCurrency(stats.data.fixedMonthlyCost)} />
            <KpiCard
              label={`PAGAS NESTE MÊS`}
              value={`${stats.data.paidCount} de ${stats.data.totalActive}`}
              hint={pendingTotal > 0 ? `${formatCurrency(pendingTotal)} ainda a pagar` : "Tudo pago"}
              accent
            />
            <div className="col-span-2 flex flex-col gap-[5px] rounded-2xl border border-divider bg-surface px-[18px] py-4 shadow-[var(--shadow-card)] sm:col-span-1">
              <span className="text-[10.5px] font-semibold tracking-[0.13em] text-text-4">PRÓXIMA A VENCER</span>
              <span className="text-[19px] font-semibold -tracking-[0.01em] text-text">
                {stats.data.nextDue ? `${stats.data.nextDue.name} · dia ${stats.data.nextDue.dueDay}` : "—"}
              </span>
              {stats.data.nextDue && (
                <span className="text-[11.5px] text-negative">
                  em {Math.max(0, stats.data.nextDue.dueDay - new Date().getDate())} dia(s)
                </span>
              )}
            </div>
          </div>
        )}

        {!bills.isError && (
        <section className="rounded-[18px] border border-divider bg-surface px-[22px] pb-2 pt-5 shadow-[var(--shadow-card)]">
          <div className="mb-1 flex items-center gap-2.5">
            <h2 className="text-[14.5px] font-semibold text-text">Contas fixas</h2>
            <span className="text-xs text-text-4">Cobradas todo mês, na mesma data</span>
          </div>

          {bills.isLoading &&
            [0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 border-b border-divider py-3.5 last:border-b-0">
                <Skeleton className="size-10 flex-none rounded-xl" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-36" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}

          {bills.data?.map((bill) => {
            const ratio = bill.averageLast3Months > 0 ? bill.expectedAmount / bill.averageLast3Months : 1;
            const above = ratio > 1.05;
            return (
              <div
                key={bill.id}
                className={cn(
                  "flex items-center gap-3 border-b border-divider py-3 last:border-b-0 md:grid md:items-center md:gap-3.5 md:py-[15px]",
                  ROW,
                )}
              >
                <div className="flex size-10 flex-none flex-col items-center justify-center rounded-xl border border-divider bg-surface-2 md:size-11">
                  <span className="font-mono text-[13px] font-medium text-text md:text-sm">{bill.dueDay}</span>
                  <span className="text-[9px] tracking-[0.08em] text-text-5">DIA</span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-[3px] md:flex-none">
                  <span className="truncate text-[13.5px] font-medium text-text">{bill.name}</span>
                  <span className="truncate text-[11.5px] capitalize text-text-4">{bill.category}</span>
                </div>

                {/* A barra de variação só cabe no desktop; no mobile o status
                    e o valor já dão a informação essencial. */}
                <div className="hidden flex-col gap-[5px] md:flex">
                  <span className="text-[11px] text-text-5">Variação vs. média</span>
                  <div className="h-1 overflow-hidden rounded-[3px] bg-track">
                    <div
                      className={cn("h-full rounded-[3px]", above ? "bg-negative" : "bg-brand")}
                      style={{ width: `${Math.min(100, Math.max(8, Math.round(ratio * 50)))}%` }}
                    />
                  </div>
                </div>

                {bill.paidThisMonth ? (
                  <span className="flex-none whitespace-nowrap rounded-full bg-brand-tint px-2.5 py-1 text-[11px] font-semibold text-brand md:justify-self-start">
                    Pago
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handlePay(bill.id)}
                    disabled={payMutation.isPending || readOnly}
                    className="flex-none whitespace-nowrap rounded-full bg-negative-tint px-2.5 py-1 text-[11px] font-semibold text-negative transition-opacity hover:opacity-80 disabled:opacity-50 md:justify-self-start"
                  >
                    A pagar
                  </button>
                )}

                <span className="flex-none whitespace-nowrap text-right font-mono text-[13px] text-text md:text-sm">
                  {formatCurrency(bill.expectedAmount)}
                </span>

                {/* Na visão do parceiro a linha é só leitura: sem toggle, editar nem excluir. */}
                <div className={cn("hidden items-center justify-end gap-1", !readOnly && "md:flex")}>
                  <Switch
                    checked={bill.active}
                    onCheckedChange={(checked) => handleToggle(bill.id, checked)}
                    aria-label="Ativa"
                    className="scale-90"
                  />
                  <button
                    type="button"
                    aria-label="Editar"
                    onClick={() => {
                      setEditing(bill);
                      setFormOpen(true);
                    }}
                    className="p-1 text-text-5 transition-colors hover:text-text"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Excluir"
                    onClick={() => setDeleting(bill)}
                    className="p-1 text-text-5 transition-colors hover:text-negative"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {bills.data?.length === 0 && (
            <p className="py-10 text-center text-sm text-text-3">
              Nenhuma conta recorrente. Cadastre água, luz, internet e outras contas fixas.
            </p>
          )}
        </section>
        )}
      </div>

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
    </>
  );
}
