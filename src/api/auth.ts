import { apiRequest } from "./client";
import type { AuthResult } from "./types";

export function login(input: { email: string; password: string }): Promise<AuthResult> {
  return apiRequest<AuthResult>("/auth/login", { method: "POST", body: input, skipAuth: true });
}

export function loginWithGoogle(input: { idToken: string }): Promise<AuthResult> {
  return apiRequest<AuthResult>("/auth/google", { method: "POST", body: input, skipAuth: true });
}
