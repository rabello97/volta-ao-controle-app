import { apiRequest } from "./client";
import type { HouseholdResponse } from "./types";

export function getHousehold(): Promise<HouseholdResponse> {
  return apiRequest<HouseholdResponse>("/household");
}
