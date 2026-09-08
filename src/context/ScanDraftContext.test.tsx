import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ScanDraftProvider, useScanDraft } from "./ScanDraftContext";
import * as creditCardsApi from "@/api/creditCards";
import * as transactionsApi from "@/api/transactions";
import type { ScanResult } from "@/api/types";

vi.mock("@/api/creditCards");
vi.mock("@/api/transactions");

const LEITURA: ScanResult = {
  encontrou: true,
  tipo: "EXPENSE",
  valor: 342.18,
  data: "2026-09-06",
  estabelecimento: "Mercado Extra",
  categoriaSugerida: "mercado",
  descricao: "Mercado Extra",
  parcelas: 1,
  cartaoSugerido: "",
  confianca: "alta",
  observacao: "",
};

function Gatilho() {
  const scan = useScanDraft();
  return (
    <button type="button" onClick={() => scan.start(LEITURA)}>
      escanear
    </button>
  );
}

function renderFluxo() {
  vi.mocked(creditCardsApi.listCreditCards).mockResolvedValue([
    { id: "card-1", nickname: "Nubank", closingDay: 3, dueDay: 10, creditLimit: null, currentInvoiceTotal: 0, utilizationPct: null },
  ]);
  vi.mocked(transactionsApi.createTransaction).mockResolvedValue({ id: "t-1" } as never);

  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <ScanDraftProvider>
        <Gatilho />
      </ScanDraftProvider>
    </QueryClientProvider>,
  );
}

describe("fluxo do scan", () => {
  beforeEach(() => vi.clearAllMocks());

  it("cria o lançamento sem cartão quando a pergunta é ignorada", async () => {
    const user = userEvent.setup();
    renderFluxo();

    await user.click(screen.getByRole("button", { name: "escanear" }));
    await screen.findByText("Li a imagem");
    await user.click(screen.getByRole("button", { name: "Salvar sem cartão" }));

    await waitFor(() => expect(transactionsApi.createTransaction).toHaveBeenCalledTimes(1));
    const enviado = vi.mocked(transactionsApi.createTransaction).mock.calls[0][0];
    expect(enviado.amount).toBe(342.18);
    expect(enviado.creditCardId).toBeUndefined();
  });

  it("vincula ao cartão escolhido", async () => {
    const user = userEvent.setup();
    renderFluxo();

    await user.click(screen.getByRole("button", { name: "escanear" }));
    await screen.findByText("Li a imagem");
    await user.click(await screen.findByRole("button", { name: /Nubank/ }));

    await waitFor(() => expect(transactionsApi.createTransaction).toHaveBeenCalledTimes(1));
    const enviado = vi.mocked(transactionsApi.createTransaction).mock.calls[0][0];
    expect(enviado.creditCardId).toBe("card-1");
    expect(enviado.invoiceChoice).toBe("CURRENT");
  });
});
