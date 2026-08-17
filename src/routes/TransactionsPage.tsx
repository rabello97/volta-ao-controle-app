import { useState } from "react";
import { Plus, Receipt, Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/EmptyState";
import { TransactionFormDialog } from "@/components/TransactionFormDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from "@/hooks/useTransactions";
import { formatCurrency, formatDate } from "@/lib/format";
import { buildTransactionFilters } from "@/lib/transactionFilters";
import type { Transaction, TransactionType } from "@/api/types";
import type { TransactionInput } from "@/api/transactions";
import { toast } from "sonner";

export function TransactionsPage() {
  const [type, setType] = useState<TransactionType | "ALL">("ALL");
  const [category, setCategory] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  const transactions = useTransactions(buildTransactionFilters(type, category));

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  async function handleSubmit(input: TransactionInput) {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input });
      } else {
        await createMutation.mutateAsync(input);
      }
      setFormOpen(false);
      setEditing(null);
    } catch {
      toast.error("Não foi possível salvar a transação.");
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync(deleting.id);
      setDeleting(null);
    } catch {
      toast.error("Não foi possível excluir a transação.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-[22px] font-bold text-text">Transações</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" /> Nova transação
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={type} onValueChange={(v) => setType(v as TransactionType | "ALL")}>
          <TabsList>
            <TabsTrigger value="ALL">Todas</TabsTrigger>
            <TabsTrigger value="EXPENSE">Saídas</TabsTrigger>
            <TabsTrigger value="INCOME">Entradas</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          placeholder="Filtrar por categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="max-w-[220px]"
        />
      </div>

      {transactions.data?.length === 0 && (
        <EmptyState
          icon={Receipt}
          title="Nenhuma transação ainda"
          description="Crie a primeira transação para começar a acompanhar suas finanças."
          action={
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="size-4" /> Nova transação
            </Button>
          }
        />
      )}

      {transactions.data && transactions.data.length > 0 && (
        <ul className="flex flex-col gap-2">
          {transactions.data.map((transaction) => (
            <li
              key={transaction.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-divider/70 bg-surface p-4 shadow-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={
                    transaction.type === "INCOME"
                      ? "flex size-9 flex-none items-center justify-center rounded-[10px] bg-positive-tint text-positive"
                      : "flex size-9 flex-none items-center justify-center rounded-[10px] bg-negative-tint text-negative"
                  }
                >
                  {transaction.type === "INCOME" ? (
                    <TrendingUp className="size-4" />
                  ) : (
                    <TrendingDown className="size-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-text">
                    {transaction.description || transaction.category}
                  </div>
                  <div className="text-xs text-text-muted">
                    {formatDate(transaction.date)} · {transaction.category}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={
                    transaction.type === "INCOME"
                      ? "text-sm font-bold text-positive"
                      : "text-sm font-bold text-negative"
                  }
                >
                  {transaction.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Editar"
                  onClick={() => {
                    setEditing(transaction);
                    setFormOpen(true);
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Excluir"
                  onClick={() => setDeleting(transaction)}
                >
                  <Trash2 className="size-4 text-negative" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <TransactionFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        transaction={editing}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir transação"
        description="Essa ação não pode ser desfeita."
        onConfirm={handleDelete}
      />
    </div>
  );
}
