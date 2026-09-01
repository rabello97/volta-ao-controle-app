import { apiRequest } from "./client";
import type { MonthlyInsight, ScanResult } from "./types";

export function getAIStatus(): Promise<{ enabled: boolean }> {
  return apiRequest<{ enabled: boolean }>("/ai/status");
}

/** A API responde 204 quando ainda não houve análise no mês, e o cliente
 *  devolve undefined nesse caso — normalizamos para null porque o React Query
 *  não aceita undefined como resultado de query. */
export function getMonthlyInsight(scope?: string, month?: string): Promise<MonthlyInsight | null> {
  return apiRequest<MonthlyInsight | null>("/ai/monthly", { query: { scope, month } }).then((r) => r ?? null);
}

export function generateMonthlyInsight(scope?: string, month?: string): Promise<MonthlyInsight> {
  return apiRequest<MonthlyInsight>("/ai/monthly", { method: "POST", body: { scope, month } });
}

export function scanImage(imageBase64: string, mediaType: string): Promise<ScanResult> {
  return apiRequest<ScanResult>("/ai/scan", { method: "POST", body: { imageBase64, mediaType } });
}
