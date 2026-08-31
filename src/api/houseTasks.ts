import { apiRequest } from "./client";
import type { HouseTask } from "./types";

export interface HouseTaskInput {
  name: string;
  category: string;
  dueDate: string;
  recurrenceMonths?: number | null;
  estimatedCost?: number | null;
  notes?: string | null;
}

export function listHouseTasks(scope?: string): Promise<HouseTask[]> {
  return apiRequest<HouseTask[]>("/house-tasks", { query: { scope } });
}

export function createHouseTask(input: HouseTaskInput): Promise<HouseTask> {
  return apiRequest<HouseTask>("/house-tasks", { method: "POST", body: input });
}

export function updateHouseTask(id: string, input: Partial<HouseTaskInput>): Promise<HouseTask> {
  return apiRequest<HouseTask>(`/house-tasks/${id}`, { method: "PATCH", body: input });
}

export function completeHouseTask(id: string): Promise<{ completed: HouseTask; next: HouseTask | null }> {
  return apiRequest(`/house-tasks/${id}/complete`, { method: "POST" });
}

export function deleteHouseTask(id: string): Promise<void> {
  return apiRequest<void>(`/house-tasks/${id}`, { method: "DELETE" });
}
