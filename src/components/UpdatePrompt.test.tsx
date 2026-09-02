import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const updateServiceWorker = vi.fn();
const setNeedRefresh = vi.fn();
let precisaAtualizar = false;

// O módulo virtual do vite-plugin-pwa não existe fora do build.
vi.mock("virtual:pwa-register/react", () => ({
  useRegisterSW: () => ({
    needRefresh: [precisaAtualizar, setNeedRefresh],
    offlineReady: [false, vi.fn()],
    updateServiceWorker,
  }),
}));

const { UpdatePrompt } = await import("./UpdatePrompt");

beforeEach(() => {
  vi.clearAllMocks();
  precisaAtualizar = false;
});

describe("UpdatePrompt", () => {
  it("não aparece quando não há versão nova", () => {
    render(<UpdatePrompt />);
    expect(screen.queryByText("Nova versão disponível")).toBeNull();
  });

  it("avisa quando há versão nova", () => {
    precisaAtualizar = true;
    render(<UpdatePrompt />);
    expect(screen.getByText("Nova versão disponível")).toBeTruthy();
  });

  /** `true` manda o service worker pular a espera e recarregar — sem isso o
   *  clique não trocaria de versão. */
  it("atualiza recarregando ao tocar em Atualizar", async () => {
    precisaAtualizar = true;
    render(<UpdatePrompt />);

    await userEvent.click(screen.getByRole("button", { name: "Atualizar" }));

    expect(updateServiceWorker).toHaveBeenCalledWith(true);
  });

  it("some sem atualizar quando o usuário dispensa", async () => {
    precisaAtualizar = true;
    render(<UpdatePrompt />);

    await userEvent.click(screen.getByRole("button", { name: "Agora não" }));

    expect(setNeedRefresh).toHaveBeenCalledWith(false);
    expect(updateServiceWorker).not.toHaveBeenCalled();
  });
});
