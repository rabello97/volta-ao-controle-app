import { apiRequest } from "./client";
import type { Wallet } from "./types";

export interface WalletInput {
  name: string;
  monthlyCredit: number;
  creditDay: number;
  openingBalance?: number;
}

export function listWallets(scope?: string): Promise<Wallet[]> {
  return apiRequest<Wallet[]>("/wallets", { query: { scope } });
}

export function createWallet(input: WalletInput): Promise<Wallet> {
  return apiRequest<Wallet>("/wallets", { method: "POST", body: input });
}

export function updateWallet(id: string, input: Partial<WalletInput>): Promise<Wallet> {
  return apiRequest<Wallet>(`/wallets/${id}`, { method: "PATCH", body: input });
}

/** Ajuste manual quando o extrato do benefício e o app divergem. */
export function adjustWalletBalance(id: string, balance: number): Promise<Wallet> {
  return apiRequest<Wallet>(`/wallets/${id}/balance`, { method: "PUT", body: { balance } });
}

export function deleteWallet(id: string): Promise<void> {
  return apiRequest<void>(`/wallets/${id}`, { method: "DELETE" });
}
