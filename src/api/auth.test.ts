import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { login, loginWithGoogle } from "./auth";
import { clearToken } from "@/lib/session";

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
