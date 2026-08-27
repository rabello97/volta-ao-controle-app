import { apiRequest } from "./client";
import type { AuthResult, User } from "./types";

export function login(input: { email: string; password: string }): Promise<AuthResult> {
  return apiRequest<AuthResult>("/auth/login", { method: "POST", body: input, skipAuth: true });
}

export function loginWithGoogle(input: { idToken: string }): Promise<AuthResult> {
  return apiRequest<AuthResult>("/auth/google", { method: "POST", body: input, skipAuth: true });
}

export function getCurrentUser(): Promise<User> {
  return apiRequest<User>("/auth/me");
}

export interface UpdateProfileInput {
  name?: string;
  theme?: "light" | "dark" | null;
  savingsGoalTarget?: number | null;
  savingsGoalSaved?: number | null;
}

export function updateProfile(input: UpdateProfileInput): Promise<User> {
  return apiRequest<User>("/auth/me", { method: "PATCH", body: input });
}

export function changePassword(input: { currentPassword?: string; newPassword: string }): Promise<void> {
  return apiRequest<void>("/auth/me/password", { method: "PATCH", body: input });
}
