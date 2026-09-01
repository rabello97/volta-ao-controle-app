import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { TransactionFormDialog } from "@/components/TransactionFormDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from "@/hooks/useTransactions";
import { useCreditCards } from "@/hooks/useCreditCards";
import { formatCurrency, formatDate } from "@/lib/format";
import { plural } from "@/lib/plural";
import { buildTransactionFilters } from "@/lib/transactionFilters";
import { scopeFor } from "@/lib/scope";
import { useMonth, monthRange } from "@/context/MonthContext";
import { useHouseholdView } from "@/context/HouseholdViewContext";
import { HouseholdViewToggle } from "@/components/HouseholdViewToggle";
import { ScanButton } from "@/components/ScanButton";
import { useAIStatus } from "@/hooks/useAI";
import type { ScanResult } from "@/api/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/Skeleton";
import { ErrorState } from "@/components/ErrorState";
import type { Transaction, TransactionType } from "@/api/types";
import type { TransactionFormPayload } from "@/api/transactions";

/** Mesma grade de colunas do mockup. Escrita literal (sem interpolar) porque o
 *  Tailwind precisa enxergar a classe no código-fonte para gerá-la. */
const GRID = "md:grid-cols-[92px_1fr_150px_130px_150px_40px]";

export function TransactionsPage() {
  const [type, setType] = useState<TransactionType | "ALL">("ALL");
  const [category, setCategory] = useState("");
  const [creditCardId, setCreditCardId] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);

  const { view, partner } = useHouseholdView();
  const month = useMonth();
  const scope = scopeFor(view, partner?.id ?? null);
  // Na visão do parceiro ou do casal a tela é só de leitura: editar dados de
  // outra pessoa continua sendo feito na conta dela.
  const readOnly = scope !== undefined;

  const { data: cards } = useCreditCards(scope);
  const transactions = useTransactions({
    ...buildTransactionFilters(type, category, creditCardId, search, page, monthRange(month.value)),
    scope,
  });

  const ai = useAIStatus();

  /** A leitura da imagem abre o formulário preenchido em vez de lançar direto:
   *  OCR erra, e conferir valor e data leva dois segundos. */
  function handleScanned(result: ScanResult) {
    const card = (cards ?? []).find(
      (c) => result.cartaoSugerido && c.nickname.toLowerCase() === result.cartaoSugerido.toLowerCase(),
    );
    setEditing(null);
    setDraft({
      type: result.tipo,
      amount: result.valor,
      date: result.data || new Date().toISOString().slice(0, 10),
      category: result.categoriaSugerida,
      description: result.descricao || result.estabelecimento,
      ...(card ? { creditCardId: card.id, invoiceChoice: "CURRENT" } : {}),
    });
    setFormOpen(true);
    if (result.confianca !== "alta") {
      toast.warning(result.observacao || "Confira os valores antes de salvar.");
    }
  }

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const result = transactions.data;
  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.limit)) : 1;
  const categories = Array.from(new Set((result?.items ?? []).map((t) => t.category)));

  function reset<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  async function handleSubmit(input: TransactionFormPayload) {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input });
      } else {
        // Só a edição pode desvincular (null); na criação isso é "sem cartão".
        await createMutation.mutateAsync({ ...input, creditCardId: input.creditCardId ?? undefined });
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
    <>
      <PageHeader
        title="Transações"
        subtitle={`${plural(result?.total ?? 0, "lançamento")} em ${month.label.toLowerCase()}`}
        ctaLabel={readOnly ? undefined : "Nova transação"}
        onCta={
          readOnly
            ? undefined
            : () => {
                setEditing(null);
                setDraft(null);
                setFormOpen(true);
              }
        }
        search={search}
        onSearchChange={reset(setSearch)}
        aside={
          <>
            <HouseholdViewToggle />
            {!readOnly && ai.data?.enabled && <ScanButton onScanned={handleScanned} label="Escanear" />}
          </>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex flex-none gap-0.5 rounded-[10px] border border-divider bg-surface p-[3px]">
            {(
              [
                { key: "ALL", label: "Todas" },
                { key: "EXPENSE", label: "Saídas" },
                { key: "INCOME", label: "Entradas" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => reset(setType)(opt.key)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3.5 py-1.5 text-[12.5px] transition-colors",
                  type === opt.key ? "bg-track font-medium text-text" : "text-text-3 hover:text-text",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <Select value={category || "all"} onValueChange={(v) => reset(setCategory)(v === "all" ? "" : v)}>
            <SelectTrigger className="h-auto w-auto gap-[7px] rounded-[10px] border-divider bg-surface px-3 py-2 text-[12.5px] text-text-3">
              <SelectValue placeholder="Categoria: todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Categoria: todas</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {cards && cards.length > 0 && (
            <Select value={creditCardId || "all"} onValueChange={(v) => reset(setCreditCardId)(v === "all" ? "" : v)}>
              <SelectTrigger className="h-auto w-auto gap-[7px] rounded-[10px] border-divider bg-surface px-3 py-2 text-[12.5px] text-text-3">
                <SelectValue placeholder="Cartão: todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cartão: todos</SelectItem>
                {cards.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nickname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {result && (
            <div className="ml-auto flex flex-wrap items-center gap-[18px] whitespace-nowrap rounded-[10px] border border-divider bg-surface px-4 py-2">
              <span className="text-xs text-text-4">{plural(result.total, "lançamento")}</span>
              <span className="font-mono text-[12.5px] text-positive">+ {formatCurrency(result.totals.income)}</span>
              <span className="font-mono text-[12.5px] text-negative">− {formatCurrency(result.totals.expense)}</span>
            </div>
          )}
        </div>

        {transactions.isError ? (
          <ErrorState onRetry={() => transactions.refetch()} />
        ) : transactions.isLoading ? (
          <section className="overflow-hidden rounded-[18px] border border-divider bg-surface">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 border-b border-divider px-4 py-3.5 last:border-b-0">
                <Skeleton className="size-[26px] flex-none rounded-lg" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-44" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </section>
        ) : result?.items.length === 0 ? (
          <section className="flex flex-col items-center gap-2 rounded-[18px] border border-divider bg-surface px-[22px] py-14">
            <div className="mb-1.5 flex size-[46px] items-center justify-center rounded-[14px] bg-brand-tint text-brand">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 5h10l-2.5-2.5M14 11H4l2.5 2.5" />
              </svg>
            </div>
            {/* Com o seletor de mês, "lista vazia" quase sempre quer dizer
                "vazia neste mês" — dizer qual evita procurar o que não sumiu. */}
            <span className="text-[15.5px] font-semibold text-text">
              {search || category || creditCardId || type !== "ALL"
                ? `Nada encontrado em ${month.label.toLowerCase()}`
                : `Nenhum lançamento em ${month.label.toLowerCase()}`}
            </span>
            <span className="max-w-[380px] text-center text-[12.5px] leading-[1.5] text-text-3">
              {search || category || creditCardId || type !== "ALL"
                ? "Tente outro mês pelas setas no topo, ou limpe os filtros."
                : "Cada lançamento alimenta o painel, os relatórios e a projeção de saldo. Leva 10 segundos."}
            </span>
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="mt-3 flex items-center gap-[7px] rounded-[10px] bg-brand px-4 py-[9px] text-[12.5px] font-semibold text-brand-ink transition-colors hover:bg-brand-hover"
            >
              <Plus className="size-3.5" /> Nova transação
            </button>
          </section>
        ) : (
          result && (
            <section className="overflow-hidden rounded-[18px] border border-divider bg-surface">
              <div className={cn("hidden gap-3 border-b border-divider bg-surface-inset px-[22px] py-3 md:grid", GRID)}>
                {["DATA", "DESCRIÇÃO", "CATEGORIA", "ORIGEM"].map((h) => (
                  <span key={h} className="text-[10.5px] font-semibold tracking-[0.1em] text-text-5">
                    {h}
                  </span>
                ))}
                <span className="text-right text-[10.5px] font-semibold tracking-[0.1em] text-text-5">VALOR</span>
                <span />
              </div>

              {result.items.map((t) => {
                const card = cards?.find((c) => c.id === t.creditCardId);
                const origin = card ? card.nickname : t.type === "INCOME" ? "Conta corrente" : "Dinheiro";
                const income = t.type === "INCOME";
                return (
                  <div
                    key={t.id}
                    className={cn(
                      "flex items-center gap-3 border-b border-divider px-4 py-3 transition-colors last:border-b-0 hover:bg-surface-2 active:bg-surface-2 md:grid md:items-center md:gap-3 md:px-[22px] md:py-[13px]",
                      GRID,
                    )}
                  >
                    {/* No mobile a data vira metadado da linha; no desktop ela é a
                        primeira coluna da grade. */}
                    <span className="hidden font-mono text-[12.5px] text-text-3 md:inline">{formatDate(t.date)}</span>

                    <div className="flex min-w-0 flex-1 items-center gap-[11px] md:flex-none">
                      <span
                        className={cn(
                          "flex size-[26px] flex-none items-center justify-center rounded-lg text-[11px] font-bold",
                          income ? "bg-brand-tint text-brand" : "bg-negative-tint text-negative",
                        )}
                      >
                        {income ? "+" : "−"}
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-[13.5px] text-text">
                          {t.description || t.category}
                          {t.installmentTotal && t.installmentTotal > 1 && (
                            <span className="ml-1.5 text-[11px] text-text-5">
                              {t.installmentNumber} de {t.installmentTotal}
                            </span>
                          )}
                        </span>
                        <span className="truncate text-[11.5px] text-text-4 md:hidden">
                          {formatDate(t.date)} · {t.category} · {origin}
                        </span>
                      </div>
                    </div>

                    <span className="hidden truncate text-xs text-text-3 md:inline">{t.category}</span>
                    <span className="hidden truncate text-xs text-text-4 md:inline">{origin}</span>

                    <span
                      className={cn(
                        "flex-none whitespace-nowrap text-right font-mono text-[13.5px]",
                        income ? "text-positive" : "text-negative",
                      )}
                    >
                      {income ? "+ " : "− "}
                      {formatCurrency(t.amount)}
                    </span>

                    <div className={cn("flex flex-none items-center justify-end gap-0.5", readOnly && "hidden")}>
                      <button
                        type="button"
                        aria-label="Editar"
                        onClick={() => {
                          setEditing(t);
                          setFormOpen(true);
                        }}
                        className="p-1.5 text-text-5 transition-colors hover:text-text"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Excluir"
                        onClick={() => setDeleting(t)}
                        className="p-1.5 text-text-5 transition-colors hover:text-negative"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center gap-3 px-[22px] py-3.5">
                <span className="text-xs text-text-4">
                  Mostrando {result.items.length} de {result.total}
                </span>
                <div className="ml-auto flex gap-1.5">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg border border-divider px-[11px] py-[5px] text-xs text-text-5 transition-colors enabled:hover:border-brand enabled:hover:text-brand disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border border-divider-strong px-[11px] py-[5px] text-xs text-text-2 transition-colors enabled:hover:border-brand enabled:hover:text-brand disabled:opacity-40"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </section>
          )
        )}
      </div>

      {!readOnly && (
      <button
        type="button"
        aria-label="Nova transação"
        onClick={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-20 flex size-14 items-center justify-center rounded-full bg-brand text-brand-ink shadow-lg transition-transform active:scale-95 sm:hidden"
      >
        <Plus className="size-6" />
      </button>
      )}

      <TransactionFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditing(null);
            setDraft(null);
          }
        }}
        transaction={editing}
        draft={draft}
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
    </>
  );
}
