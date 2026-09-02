import { describe, expect, it, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

const sucesso = vi.fn();
vi.mock("sonner", () => ({ toast: { success: (m: string) => sucesso(m) } }));
vi.mock("virtual:pwa-register/react", () => ({ useRegisterSW: () => ({}) }));

const { UpdateWatcher } = await import("./UpdateWatcher");

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("UpdateWatcher", () => {
  it("não avisa na primeira visita — não há versão anterior para comparar", () => {
    render(<UpdateWatcher />);
    expect(sucesso).not.toHaveBeenCalled();
  });

  it("não avisa quando o build é o mesmo de antes", () => {
    localStorage.setItem("vac_build", __BUILD_ID__);
    render(<UpdateWatcher />);
    expect(sucesso).not.toHaveBeenCalled();
  });

  /** É o ponto de tudo isso: a troca de versão deixa de ser silenciosa. */
  it("avisa quando o build mudou desde a última visita", () => {
    localStorage.setItem("vac_build", "build-antigo");
    render(<UpdateWatcher />);
    expect(sucesso).toHaveBeenCalledWith("App atualizado para a versão mais recente.");
  });

  it("guarda o build atual para a próxima comparação", () => {
    localStorage.setItem("vac_build", "build-antigo");
    render(<UpdateWatcher />);
    expect(localStorage.getItem("vac_build")).toBe(__BUILD_ID__);
  });
});
