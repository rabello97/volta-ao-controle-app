import { apiRequest } from "./client";
import type { ShoppingItem, ShoppingList, ShoppingListSummary, Transaction } from "./types";

export interface ShoppingItemInput {
  name: string;
  quantity?: number;
  estimatedPrice?: number | null;
}

export interface ShoppingItemUpdate {
  name?: string;
  quantity?: number;
  estimatedPrice?: number | null;
  actualPrice?: number | null;
  purchased?: boolean;
}

export interface FinishShoppingListInput {
  category?: string;
  date?: string;
  creditCardId?: string;
}

export function listShoppingLists(scope?: string): Promise<ShoppingListSummary[]> {
  return apiRequest<ShoppingListSummary[]>("/shopping-lists", { query: { scope } });
}

export function getShoppingList(id: string): Promise<ShoppingList> {
  return apiRequest<ShoppingList>(`/shopping-lists/${id}`);
}

export function createShoppingList(name: string): Promise<ShoppingList> {
  return apiRequest<ShoppingList>("/shopping-lists", { method: "POST", body: { name } });
}

export function deleteShoppingList(id: string): Promise<void> {
  return apiRequest<void>(`/shopping-lists/${id}`, { method: "DELETE" });
}

export function addShoppingItem(listId: string, input: ShoppingItemInput): Promise<ShoppingItem> {
  return apiRequest<ShoppingItem>(`/shopping-lists/${listId}/items`, { method: "POST", body: input });
}

export function updateShoppingItem(listId: string, itemId: string, input: ShoppingItemUpdate): Promise<ShoppingItem> {
  return apiRequest<ShoppingItem>(`/shopping-lists/${listId}/items/${itemId}`, { method: "PATCH", body: input });
}

export function removeShoppingItem(listId: string, itemId: string): Promise<void> {
  return apiRequest<void>(`/shopping-lists/${listId}/items/${itemId}`, { method: "DELETE" });
}

export function finishShoppingList(
  listId: string,
  input: FinishShoppingListInput = {},
): Promise<{ list: ShoppingList; transaction: Transaction }> {
  return apiRequest(`/shopping-lists/${listId}/finish`, { method: "POST", body: input });
}
