import { useState } from "react";
import { Check, Plus, Trash2, ShoppingBasket } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Skeleton } from "@/components/Skeleton";
import { ErrorState } from "@/components/ErrorState";
import { formatCurrency, formatDate } from "@/lib/format";
import { itemTotal, parsePrice, sumItems } from "@/lib/shopping";
import { cn } from "@/lib/utils";
import {
  useAddShoppingItem,
  useCreateShoppingList,
  useDeleteShoppingList,
  useFinishShoppingList,
  useRemoveShoppingItem,
  useShoppingList,
  useShoppingLists,
  useUpdateShoppingItem,
} from "@/hooks/useShoppingLists";
import type { ShoppingItem, ShoppingListSummary } from "@/api/types";

function ListCard({
  list,
  active,
  onSelect,
}: {
  list: ShoppingListSummary;
  active: boolean;
  onSelect: () => void;
}) {
  const done = list.status === "DONE";
  const progress = list.itemCount > 0 ? (list.purchasedCount / list.itemCount) * 100 : 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col gap-2 rounded-2xl border px-4 py-3.5 text-left transition-colors",
        active ? "border-brand bg-brand-tint" : "border-divider bg-surface hover:border-divider-strong",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-text">{list.name}</span>
        {done ? (
          <span className="flex-none rounded-full bg-brand-tint px-2 py-0.5 text-[10.5px] font-semibold text-brand">
            Finalizada
          </span>
        ) : (
          <span className="flex-none font-mono text-[12.5px] text-text-3">
            {list.purchasedCount}/{list.itemCount}
          </span>
        )}
      </div>

      <div className="h-1 overflow-hidden rounded-[3px] bg-track">
        <div className="h-full rounded-[3px] bg-brand" style={{ width: `${Math.round(progress)}%` }} />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-text-4">
          {done && list.closedAt ? formatDate(list.closedAt) : `Previsto ${formatCurrency(list.estimatedTotal)}`}
        </span>
        <span className="font-mono text-[12.5px] text-text">{formatCurrency(list.purchasedTotal)}</span>
      </div>
    </button>
  );
}

export function ShoppingLists({ scope }: { scope?: string }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemQty, setItemQty] = useState("1");
  const [itemPrice, setItemPrice] = useState("");
  const [deleting, setDeleting] = useState<ShoppingListSummary | null>(null);
  const [finishing, setFinishing] = useState(false);

  const lists = useShoppingLists(scope);
  const items = lists.data ?? [];
  const currentId = selectedId ?? items[0]?.id ?? null;
  const detail = useShoppingList(currentId);

  const createList = useCreateShoppingList();
  const deleteList = useDeleteShoppingList();
  const addItem = useAddShoppingItem();
  const updateItem = useUpdateShoppingItem();
  const removeItem = useRemoveShoppingItem();
  const finish = useFinishShoppingList();

  const list = detail.data;
  const open = list?.status === "OPEN";
  const purchased = (list?.items ?? []).filter((item) => item.purchased);
  const purchasedTotal = purchased.reduce((sum, item) => sum + itemTotal(item), 0);

  async function handleCreateList() {
    const name = newListName.trim();
    if (!name) return;
    try {
      const created = await createList.mutateAsync(name);
      setNewListName("");
      setSelectedId(created.id);
    } catch {
      toast.error("Não foi possível criar a lista.");
    }
  }

  async function handleAddItem() {
    const name = itemName.trim();
    if (!name || !currentId) return;
    const quantity = Number(itemQty) || 1;
    try {
      await addItem.mutateAsync({
        listId: currentId,
        input: { name, quantity, estimatedPrice: parsePrice(itemPrice) },
      });
      setItemName("");
      setItemQty("1");
      setItemPrice("");
    } catch {
      toast.error("Não foi possível adicionar o item.");
    }
  }

  async function handleTogglePurchased(item: ShoppingItem) {
    if (!currentId) return;
    try {
      await updateItem.mutateAsync({
        listId: currentId,
        itemId: item.id,
        // Ao marcar sem preço pago, a estimativa vira o valor real — assim dá
        // para finalizar a compra sem digitar tudo de novo.
        input: {
          purchased: !item.purchased,
          actualPrice: !item.purchased && item.actualPrice === null ? item.estimatedPrice : undefined,
        },
      });
    } catch {
      toast.error("Não foi possível atualizar o item.");
    }
  }

  async function handlePriceChange(item: ShoppingItem, value: string) {
    if (!currentId) return;
    try {
      await updateItem.mutateAsync({
        listId: currentId,
        itemId: item.id,
        input: item.purchased ? { actualPrice: parsePrice(value) } : { estimatedPrice: parsePrice(value) },
      });
    } catch {
      toast.error("Não foi possível salvar o preço.");
    }
  }

  async function handleFinish() {
    if (!currentId) return;
    try {
      const result = await finish.mutateAsync({ listId: currentId, input: {} });
      setFinishing(false);
      toast.success(`Compra lançada: ${formatCurrency(Number(result.transaction.amount))}`);
    } catch {
      toast.error("Não foi possível finalizar a compra.");
    }
  }

  async function handleDeleteList() {
    if (!deleting) return;
    try {
      await deleteList.mutateAsync(deleting.id);
      if (deleting.id === currentId) setSelectedId(null);
      setDeleting(null);
    } catch {
      toast.error("Não foi possível excluir a lista.");
    }
  }

  return (
    <>
      {lists.isError ? (
        <ErrorState onRetry={() => lists.refetch()} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <section className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 rounded-2xl border border-divider bg-surface px-3 py-2">
              <input
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
                placeholder="Nova lista (ex.: Mercado)"
                className="min-w-0 flex-1 bg-transparent text-[13px] text-text outline-none placeholder:text-text-4"
              />
              <button
                type="button"
                onClick={handleCreateList}
                disabled={!newListName.trim() || createList.isPending}
                aria-label="Criar lista"
                className="flex size-7 flex-none items-center justify-center rounded-lg bg-brand text-brand-fg transition-opacity disabled:opacity-40"
              >
                <Plus className="size-4" />
              </button>
            </div>

            {lists.isLoading &&
              [0, 1, 2].map((i) => <Skeleton key={i} className="h-[92px] rounded-2xl" />)}

            {items.map((entry) => (
              <ListCard
                key={entry.id}
                list={entry}
                active={entry.id === currentId}
                onSelect={() => setSelectedId(entry.id)}
              />
            ))}

            {!lists.isLoading && items.length === 0 && (
              <p className="rounded-2xl border border-dashed border-divider px-4 py-8 text-center text-[12.5px] text-text-4">
                Nenhuma lista ainda. Crie uma acima e vá anotando o que precisa comprar.
              </p>
            )}
          </section>

          <section className="flex flex-col gap-3 rounded-[18px] border border-divider bg-surface px-4 py-4 shadow-[var(--shadow-card)] sm:px-[22px]">
            {!list ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <ShoppingBasket className="size-7 text-text-5" />
                <span className="text-[13px] text-text-3">Escolha uma lista para ver os itens</span>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="flex-1 text-[15px] font-semibold text-text">{list.name}</h2>
                  <span className="font-mono text-[13px] text-text-3">
                    {formatCurrency(purchasedTotal)} de {formatCurrency(sumItems(list.items))}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDeleting(items.find((l) => l.id === list.id) ?? null)}
                    aria-label="Excluir lista"
                    className="p-1 text-text-5 transition-colors hover:text-negative"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {open && (
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-divider bg-surface-2 px-3 py-2">
                    <input
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                      placeholder="O que falta comprar?"
                      className="min-w-[140px] flex-1 bg-transparent text-[13px] text-text outline-none placeholder:text-text-4"
                    />
                    <input
                      value={itemQty}
                      onChange={(e) => setItemQty(e.target.value)}
                      inputMode="numeric"
                      aria-label="Quantidade"
                      className="w-12 rounded-lg border border-divider bg-surface px-2 py-1 text-center font-mono text-[12.5px] text-text outline-none"
                    />
                    <input
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      inputMode="decimal"
                      placeholder="R$"
                      aria-label="Preço estimado"
                      className="w-20 rounded-lg border border-divider bg-surface px-2 py-1 text-right font-mono text-[12.5px] text-text outline-none placeholder:text-text-4"
                    />
                    <button
                      type="button"
                      onClick={handleAddItem}
                      disabled={!itemName.trim() || addItem.isPending}
                      className="flex-none rounded-lg bg-brand px-3 py-1.5 text-[12.5px] font-semibold text-brand-fg transition-opacity disabled:opacity-40"
                    >
                      Anotar
                    </button>
                  </div>
                )}

                <div className="flex flex-col">
                  {list.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 border-b border-divider py-2.5 last:border-b-0"
                    >
                      <button
                        type="button"
                        onClick={() => handleTogglePurchased(item)}
                        disabled={!open}
                        aria-label={item.purchased ? "Desmarcar" : "Marcar como comprado"}
                        className={cn(
                          "flex size-5 flex-none items-center justify-center rounded-md border transition-colors",
                          item.purchased ? "border-brand bg-brand text-brand-fg" : "border-divider-strong text-transparent",
                        )}
                      >
                        <Check className="size-3.5" />
                      </button>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <span
                          className={cn(
                            "truncate text-[13.5px] text-text",
                            item.purchased && "text-text-4 line-through",
                          )}
                        >
                          {item.name}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[11px] text-text-4">{item.quantity} un.</span>
                        )}
                      </div>

                      {/* Depois de finalizada a lista vira histórico: o preço
                          aparece formatado, sem campo editável. */}
                      {open ? (
                        <input
                          defaultValue={
                            (item.actualPrice ?? item.estimatedPrice) === null
                              ? ""
                              : String(item.actualPrice ?? item.estimatedPrice)
                          }
                          onBlur={(e) => handlePriceChange(item, e.target.value)}
                          inputMode="decimal"
                          placeholder="R$"
                          aria-label={`Preço de ${item.name}`}
                          className="w-20 flex-none rounded-lg border border-divider bg-surface px-2 py-1 text-right font-mono text-[12.5px] text-text outline-none placeholder:text-text-4"
                        />
                      ) : (
                        <span className="w-20 flex-none text-right font-mono text-[12.5px] text-text-3">
                          {itemTotal(item) > 0 ? formatCurrency(itemTotal(item)) : "—"}
                        </span>
                      )}

                      {open && (
                        <button
                          type="button"
                          onClick={() => removeItem.mutateAsync({ listId: list.id, itemId: item.id })}
                          aria-label="Remover item"
                          className="flex-none p-1 text-text-5 transition-colors hover:text-negative"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  ))}

                  {list.items.length === 0 && (
                    <p className="py-10 text-center text-[12.5px] text-text-4">
                      Lista vazia. Anote o primeiro item aí em cima.
                    </p>
                  )}
                </div>

                {open && list.items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFinishing(true)}
                    disabled={purchased.length === 0}
                    className="mt-1 rounded-xl bg-brand px-4 py-2.5 text-[13px] font-semibold text-brand-fg transition-opacity disabled:opacity-40"
                  >
                    Finalizar compra · {formatCurrency(purchasedTotal)}
                  </button>
                )}

                {!open && (
                  <p className="rounded-xl border border-divider bg-surface-2 px-3 py-2.5 text-[12.5px] text-text-3">
                    Compra finalizada e lançada como despesa de {formatCurrency(purchasedTotal)}.
                  </p>
                )}
              </>
            )}
          </section>
        </div>
      )}

      <ConfirmDialog
        open={finishing}
        onOpenChange={setFinishing}
        title="Finalizar compra"
        description={`Vamos lançar uma despesa de ${formatCurrency(purchasedTotal)} na categoria "mercado" com os ${purchased.length} item(ns) marcados. A lista fica salva no histórico.`}
        confirmLabel="Finalizar e lançar"
        tone="default"
        onConfirm={handleFinish}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(value) => !value && setDeleting(null)}
        title="Excluir lista"
        description="A lista e os itens dela somem. A despesa já lançada continua nas transações."
        onConfirm={handleDeleteList}
      />
    </>
  );
}
