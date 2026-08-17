import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { changePassword, getCurrentUser, login, loginWithGoogle, updateProfile } from "./auth";
import { clearToken, setToken } from "@/lib/session";

function mockFetchOk(body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => body,
  });
}

beforeEach(() => {
  clearToken();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("login", () => {
  it("envia e-mail e senha para POST /auth/login sem token de autorização", async () => {
    const fetchMock = mockFetchOk({ token: "t", user: { id: "1", name: "Ana", email: "ana@example.com" } });
    vi.stubGlobal("fetch", fetchMock);

    await login({ email: "ana@example.com", password: "segredo" });

    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/auth/login");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({ email: "ana@example.com", password: "segredo" });
    expect(options.headers.Authorization).toBeUndefined();
  });
});

describe("loginWithGoogle", () => {
  it("envia o idToken para POST /auth/google", async () => {
    const fetchMock = mockFetchOk({ token: "t", user: { id: "1", name: "Ana", email: "ana@example.com" } });
    vi.stubGlobal("fetch", fetchMock);

    await loginWithGoogle({ idToken: "google-id-token-123" });

    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/auth/google");
    expect(JSON.parse(options.body)).toEqual({ idToken: "google-id-token-123" });
  });
});

describe("getCurrentUser", () => {
  it("busca GET /auth/me com o token de autorização", async () => {
    setToken("session-token");
    const fetchMock = mockFetchOk({ id: "1", name: "Ana", email: "ana@example.com" });
    vi.stubGlobal("fetch", fetchMock);

    await getCurrentUser();

    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/auth/me");
    expect(options.headers.Authorization).toBe("Bearer session-token");
  });
});

describe("updateProfile", () => {
  it("envia PATCH /auth/me com o novo nome", async () => {
    setToken("session-token");
    const fetchMock = mockFetchOk({ id: "1", name: "Ana Paula", email: "ana@example.com" });
    vi.stubGlobal("fetch", fetchMock);

    await updateProfile({ name: "Ana Paula" });

    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/auth/me");
    expect(options.method).toBe("PATCH");
    expect(JSON.parse(options.body)).toEqual({ name: "Ana Paula" });
  });
});

describe("changePassword", () => {
  it("envia PATCH /auth/me/password com a senha atual e a nova", async () => {
    setToken("session-token");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204, json: async () => null });
    vi.stubGlobal("fetch", fetchMock);

    await changePassword({ currentPassword: "antiga", newPassword: "novaSenha123" });

    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/auth/me/password");
    expect(options.method).toBe("PATCH");
    expect(JSON.parse(options.body)).toEqual({ currentPassword: "antiga", newPassword: "novaSenha123" });
  });
});
