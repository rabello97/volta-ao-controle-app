import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AssistantSheet } from "./AssistantSheet";
import * as aiApi from "@/api/ai";
import * as cardsApi from "@/api/creditCards";
import * as walletsApi from "@/api/wallets";
import * as txApi from "@/api/transactions";

vi.mock("@/api/ai");
vi.mock("@/api/creditCards");
vi.mock("@/api/wallets");
vi.mock("@/api/transactions");

function acao(over: Partial<Record<string, unknown>> = {}) {
  return {
    tipo: "criar_transacao" as const,
    resumo: "Saída de R$ 45,00",
    transacao: {
      type: "EXPENSE" as const,
      amount: 45,
      date: "2026-09-08",
      category: "transporte",
      description: "Posto",
      creditCardNickname: "",
      walletName: "",
      installmentTotal: 1,
      ...over,
    },
  };
}

function renderSheet() {
  vi.mocked(cardsApi.listCreditCards).mockResolvedValue([
    { id: "card-1", nickname: "Nubank", closingDay: 3, dueDay: 10, creditLimit: null, currentInvoiceTotal: 0, utilizationPct: null },
  ]);
  vi.mocked(walletsApi.listWallets).mockResolvedValue([
    { id: "w-1", name: "VR Bruna", userId: "u", monthlyCredit: 640, creditDay: 15, balance: 480, active: true, daysUntilNextCredit: 7, createdAt: "" } as never,
  ]);
  vi.mocked(txApi.createTransaction).mockResolvedValue({ id: "t-1" } as never);
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <AssistantSheet open onOpenChange={() => {}} />
    </QueryClientProvider>,
  );
}

async function enviar(user: ReturnType<typeof userEvent.setup>, frase: string) {
  await user.type(screen.getByPlaceholderText(/gastei 45/i), frase);
  await user.click(screen.getByRole("button", { name: "Enviar" }));
}

describe("AssistantSheet", () => {
  beforeEach(() => vi.clearAllMocks());

  it("não salva nada só por interpretar — espera a confirmação", async () => {
    const user = userEvent.setup();
    vi.mocked(aiApi.askAssistant).mockResolvedValue({ resposta: "ok", acoes: [acao()], duvidas: [] });
    renderSheet();
    await enviar(user, "gastei 45 no posto");

    await screen.findByRole("button", { name: /Confirmar/ });
    expect(txApi.createTransaction).not.toHaveBeenCalled();
  });

  it("converte o apelido do cartão no id na hora de salvar", async () => {
    const user = userEvent.setup();
    vi.mocked(aiApi.askAssistant).mockResolvedValue({
      resposta: "ok",
      acoes: [acao({ creditCardNickname: "nubank" })],
      duvidas: [],
    });
    renderSheet();
    await enviar(user, "gastei 45 no posto pelo nubank");
    await user.click(await screen.findByRole("button", { name: /Confirmar/ }));

    await waitFor(() => expect(txApi.createTransaction).toHaveBeenCalledTimes(1));
    const enviado = vi.mocked(txApi.createTransaction).mock.calls[0][0];
    expect(enviado.creditCardId).toBe("card-1");
    expect(enviado.invoiceChoice).toBe("CURRENT");
    expect(enviado.walletId).toBeUndefined();
  });

  it("converte o nome do benefício no id", async () => {
    const user = userEvent.setup();
    vi.mocked(aiApi.askAssistant).mockResolvedValue({
      resposta: "ok",
      acoes: [acao({ walletName: "VR Bruna", category: "mercado" })],
      duvidas: [],
    });
    renderSheet();
    await enviar(user, "paguei 45 no VR da Bruna");
    await user.click(await screen.findByRole("button", { name: /Confirmar/ }));

    await waitFor(() => expect(txApi.createTransaction).toHaveBeenCalledTimes(1));
    const enviado = vi.mocked(txApi.createTransaction).mock.calls[0][0];
    expect(enviado.walletId).toBe("w-1");
    expect(enviado.creditCardId).toBeUndefined();
  });

  it("salva as duas quando a frase tem dois gastos", async () => {
    const user = userEvent.setup();
    vi.mocked(aiApi.askAssistant).mockResolvedValue({
      resposta: "ok",
      acoes: [acao(), acao({ amount: 38, category: "alimentação" })],
      duvidas: [],
    });
    renderSheet();
    await enviar(user, "gastei 45 no posto e 38 no almoço");
    await user.click(await screen.findByRole("button", { name: /Confirmar 2 lançamentos/ }));

    await waitFor(() => expect(txApi.createTransaction).toHaveBeenCalledTimes(2));
  });

  it("não mostra botão de confirmar quando a IA não propõe ação", async () => {
    const user = userEvent.setup();
    vi.mocked(aiApi.askAssistant).mockResolvedValue({
      resposta: "Ainda não sei apagar transações.",
      acoes: [],
      duvidas: [],
    });
    renderSheet();
    await enviar(user, "apaga tudo");

    await screen.findByText(/não sei apagar/i);
    expect(screen.queryByRole("button", { name: /Confirmar/ })).toBeNull();
  });
});
