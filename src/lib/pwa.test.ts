import { afterEach, describe, expect, it, vi } from "vitest";
import { purgeLegacyCaches } from "./pwa";

function stubCaches(keys: string[]) {
  const deleted: string[] = [];
  vi.stubGlobal("caches", {
    keys: () => Promise.resolve(keys),
    delete: (name: string) => {
      deleted.push(name);
      return Promise.resolve(true);
    },
  });
  return deleted;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("purgeLegacyCaches", () => {
  it("apaga o cache de API deixado por versões anteriores", async () => {
    const deleted = stubCaches(["api", "fonts", "workbox-precache-v2"]);
    await purgeLegacyCaches();
    expect(deleted).toEqual(["api"]);
  });

  it("não mexe nos caches em uso", async () => {
    const deleted = stubCaches(["fonts", "workbox-precache-v2"]);
    await purgeLegacyCaches();
    expect(deleted).toEqual([]);
  });

  it("segue em frente se o storage recusar o acesso", async () => {
    vi.stubGlobal("caches", {
      keys: () => Promise.reject(new Error("denied")),
      delete: () => Promise.resolve(true),
    });
    await expect(purgeLegacyCaches()).resolves.toBeUndefined();
  });
});
