import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addShoppingItem,
  createShoppingList,
  deleteShoppingList,
  finishShoppingList,
  getShoppingList,
  listShoppingLists,
  removeShoppingItem,
  updateShoppingItem,
  type FinishShoppingListInput,
  type ShoppingItemInput,
  type ShoppingItemUpdate,
} from "@/api/shoppingLists";

/** Invalida tudo que muda quando uma compra é finalizada: a lista vira uma
 *  despesa, então painel, transações e cartões também saem do lugar. */
function useInvalidateShopping() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["balance-series"] });
    queryClient.invalidateQueries({ queryKey: ["category-summary"] });
  };
}

export function useShoppingLists(scope?: string) {
  return useQuery({
    queryKey: ["shopping-lists", scope ?? "self"],
    queryFn: () => listShoppingLists(scope),
  });
}

export function useShoppingList(id: string | null) {
  return useQuery({
    queryKey: ["shopping-lists", "detail", id],
    queryFn: () => getShoppingList(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateShoppingList() {
  const invalidate = useInvalidateShopping();
  return useMutation({ mutationFn: (name: string) => createShoppingList(name), onSuccess: invalidate });
}

export function useDeleteShoppingList() {
  const invalidate = useInvalidateShopping();
  return useMutation({ mutationFn: (id: string) => deleteShoppingList(id), onSuccess: invalidate });
}

export function useAddShoppingItem() {
  const invalidate = useInvalidateShopping();
  return useMutation({
    mutationFn: ({ listId, input }: { listId: string; input: ShoppingItemInput }) => addShoppingItem(listId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateShoppingItem() {
  const invalidate = useInvalidateShopping();
  return useMutation({
    mutationFn: ({ listId, itemId, input }: { listId: string; itemId: string; input: ShoppingItemUpdate }) =>
      updateShoppingItem(listId, itemId, input),
    onSuccess: invalidate,
  });
}

export function useRemoveShoppingItem() {
  const invalidate = useInvalidateShopping();
  return useMutation({
    mutationFn: ({ listId, itemId }: { listId: string; itemId: string }) => removeShoppingItem(listId, itemId),
    onSuccess: invalidate,
  });
}

export function useFinishShoppingList() {
  const invalidate = useInvalidateShopping();
  return useMutation({
    mutationFn: ({ listId, input }: { listId: string; input?: FinishShoppingListInput }) =>
      finishShoppingList(listId, input),
    onSuccess: invalidate,
  });
}
