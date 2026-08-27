import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TransactionFormDialog } from "./TransactionFormDialog";
import * as creditCardsApi from "@/api/creditCards";

vi.mock("@/api/creditCards");

function renderDialog() {
  vi.mocked(creditCardsApi.listCreditCards).mockResolvedValue([
    {
      id: "card-1",
      nickname: "Nubank",
      closingDay: 10,
      dueDay: 17,
      creditLimit: null,
      currentInvoiceTotal: 0,
      utilizationPct: null,
    },
  ]);

  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <TransactionFormDialog open onOpenChange={() => {}} onSubmit={vi.fn()} isSubmitting={false} />
    </QueryClientProvider>,
  );
}

describe("TransactionFormDialog", () => {
  it("mostra o campo de cartão quando o tipo é saída (padrão)", () => {
    renderDialog();
    expect(screen.getByText("Cartão (opcional)")).toBeInTheDocument();
  });

  it("oculta o campo de cartão quando o tipo é entrada", async () => {
    renderDialog();
    const user = (await import("@testing-library/user-event")).default.setup();
    await user.click(screen.getByRole("tab", { name: "Entrada" }));

    expect(screen.queryByText("Cartão (opcional)")).not.toBeInTheDocument();
  });
});
