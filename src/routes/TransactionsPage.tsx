import { useState } from "react";
import { Plus, Receipt, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/EmptyState";
import { MoneyValue } from "@/components/MoneyValue";
import { TransactionFormDialog } from "@/components/TransactionFormDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from "@/hooks/useTransactions";
import { useCreditCards } from "@/hooks/useCreditCards";
import { formatDate } from "@/lib/format";
import { buildTransactionFilters } from "@/lib/transactionFilters";
import type { Transaction, TransactionType } from "@/api/types";
import type { TransactionInput } from "@/api/transactions";
import { toast } from "sonner";

export function TransactionsPage() {
  const [type, setType] = useState<TransactionType | "ALL">("ALL");
  const [category, setCategory] = useState("");
  const [creditCardId, setCreditCardId] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  const { data: cards } = useCreditCards();
  const transactions = useTransactions(buildTransactionFilters(type, category, creditCardId, search, page));

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  function resetPageAnd<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

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

  const result = transactions.data;
  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.limit)) : 1;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-[22px] font-semibold text-text">Transações</h1>
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
        <Tabs value={type} onValueChange={(v) => resetPageAnd(setType)(v as TransactionType | "ALL")}>
          <TabsList>
            <TabsTrigger value="ALL">Todas</TabsTrigger>
            <TabsTrigger value="EXPENSE">Saídas</TabsTrigger>
            <TabsTrigger value="INCOME">Entradas</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          placeholder="Categoria"
          value={category}
          onChange={(e) => resetPageAnd(setCategory)(e.target.value)}
          className="max-w-[160px]"
        />
        {cards && cards.length > 0 && (
          <Select value={creditCardId || "all"} onValueChange={(v) => resetPageAnd(setCreditCardId)(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Cartão: todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cartão: todos</SelectItem>
              {cards.map((card) => (
                <SelectItem key={card.id} value={card.id}>
                  {card.nickname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-text-4" />
          <Input
            placeholder="Buscar"
            value={search}
            onChange={(e) => resetPageAnd(setSearch)(e.target.value)}
            className="max-w-[180px] pl-8"
          />
        </div>

        {result && (
          <div className="ml-auto flex items-center gap-3 text-[13px]">
            <span className="text-text-3">{result.total} lançamento(s)</span>
            <MoneyValue value={result.totals.income} tone="positive" signed className="font-semibold" />
            <MoneyValue value={-result.totals.expense} tone="negative" signed className="font-semibold" />
          </div>
        )}
      </div>

      {result?.items.length === 0 && (
        <EmptyState
          icon={Receipt}
          title="Nenhuma transação ainda"
          description="Comece registrando um gasto ou uma entrada."
          action={
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="size-4" /> Nova transação
            </Button>
          }
        />
      )}

      {result && result.items.length > 0 && (
        <div className="rounded-2xl border border-divider bg-surface shadow-[var(--shadow-card)]">
          <Table>
            <TableHeader>
              <TableRow className="border-divider hover:bg-transparent">
                <TableHead className="text-text-4">Data</TableHead>
                <TableHead className="text-text-4">Descrição</TableHead>
                <TableHead className="text-text-4">Categoria</TableHead>
                <TableHead className="text-text-4">Origem</TableHead>
                <TableHead className="text-right text-text-4">Valor</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((transaction) => {
                const card = cards?.find((c) => c.id === transaction.creditCardId);
                const origin = card ? card.nickname : transaction.type === "INCOME" ? "Conta corrente" : "Dinheiro";
                return (
                  <TableRow key={transaction.id} className="border-divider">
                    <TableCell className="font-mono text-text-3">{formatDate(transaction.date)}</TableCell>
                    <TableCell className="text-text">
                      {transaction.description || transaction.category}
                      {transaction.installmentTotal && transaction.installmentTotal > 1 && (
                        <span className="ml-1.5 text-xs text-text-4">
                          {transaction.installmentNumber} de {transaction.installmentTotal}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-text-3">{transaction.category}</TableCell>
                    <TableCell className="text-text-3">{origin}</TableCell>
                    <TableCell className="text-right">
                      <MoneyValue
                        value={transaction.type === "INCOME" ? transaction.amount : -Number(transaction.amount)}
                        tone={transaction.type === "INCOME" ? "positive" : "negative"}
                        signed
                        className="font-semibold"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
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
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between border-t border-divider px-4 py-3 text-[13px] text-text-3">
            <span>
              Página {result.page} de {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
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
