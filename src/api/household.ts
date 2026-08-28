import { apiRequest } from "./client";
import type { HouseholdInvite, HouseholdInvitesResponse, HouseholdResponse } from "./types";

export function getHousehold(): Promise<HouseholdResponse> {
  return apiRequest<HouseholdResponse>("/household");
}

export function listInvites(): Promise<HouseholdInvitesResponse> {
  return apiRequest<HouseholdInvitesResponse>("/household/invites");
}

export function inviteToHousehold(toEmail: string): Promise<HouseholdInvite> {
  return apiRequest<HouseholdInvite>("/household/invite", { method: "POST", body: { toEmail } });
}

export function acceptInvite(inviteId: string): Promise<unknown> {
  return apiRequest(`/household/invite/${inviteId}/accept`, { method: "POST" });
}

export function declineInvite(inviteId: string): Promise<HouseholdInvite> {
  return apiRequest<HouseholdInvite>(`/household/invite/${inviteId}/decline`, { method: "POST" });
}

export function leaveHousehold(): Promise<void> {
  return apiRequest<void>("/household", { method: "DELETE" });
}
