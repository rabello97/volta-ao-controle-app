import { useState } from "react";
import { Check, Pencil, Trash2, X, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";
import { parsePrice } from "@/lib/shopping";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  useAdjustWalletBalance,
  useCreateWallet,
  useDeleteWallet,
  useUpdateWallet,
  useWallets,
} from "@/hooks/useWallets";
import type { Wallet } from "@/api/types";

/** Cadastro do VR e afins: quanto cai, em que dia e quanto tem hoje. */
export function WalletSettings() {
  const wallets = useWallets();
  const create = useCreateWallet();
  const adjust = useAdjustWalletBalance();
  const update = useUpdateWallet();
  const remove = useDeleteWallet();

  const [name, setName] = useState("VR");
  const [credit, setCredit] = useState("");
  const [day, setDay] = useState("5");
  const [balance, setBalance] = useState("");
  const [deleting, setDeleting] = useState<Wallet | null>(null);
  // Preenchido = o formulário acima vira edição desse benefício.
  const [editando, setEditando] = useState<Wallet | null>(null);

  function limpar() {
    setEditando(null);
    setName("VR");
    setCredit("");
    setDay("5");
    setBalance("");
  }

  function abrirEdicao(wallet: Wallet) {
    setEditando(wallet);
    setName(wallet.name);
    setCredit(String(wallet.monthlyCredit));
    setDay(String(wallet.creditDay));
    setBalance("");
  }

  async function handleSubmit() {
    const monthlyCredit = parsePrice(credit);
    const creditDay = Number(day);
    if (!name.trim() || monthlyCredit === null || monthlyCredit <= 0) {
      toast.error("Informe o nome e quanto cai por mês.");
      return;
    }
    if (!Number.isInteger(creditDay) || creditDay < 1 || creditDay > 31) {
      toast.error("O dia do crédito deve estar entre 1 e 31.");
      return;
    }
    try {
      if (editando) {
        await update.mutateAsync({ id: editando.id, input: { name: name.trim(), monthlyCredit, creditDay } });
      } else {
        await create.mutateAsync({
          name: name.trim(),
          monthlyCredit,
          creditDay,
          openingBalance: parsePrice(balance) ?? 0,
        });
      }
      limpar();
    } catch {
      toast.error("Não foi possível salvar o benefício.");
    }
  }

  async function handleAdjust(wallet: Wallet, value: string) {
    const parsed = parsePrice(value);
    if (parsed === null) return;
    try {
      await adjust.mutateAsync({ id: wallet.id, balance: parsed });
      toast.success("Saldo ajustado.");
    } catch {
      toast.error("Não foi possível ajustar o saldo.");
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      setDeleting(null);
    } catch {
      toast.error("Não foi possível excluir.");
    }
  }

  return (
    <div className="rounded-[18px] border border-divider bg-surface px-[22px] py-5 shadow-[var(--shadow-card)]">
      <div className="mb-1 flex flex-wrap items-center gap-2.5">
        <WalletIcon className="size-4 text-text-4" />
        <h2 className="text-[15px] font-semibold text-text">Benefícios</h2>
        <span className="text-xs text-text-4">VR, VA, vale-combustível — dinheiro que não é da conta</span>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-2.5">
        <label className="flex min-w-[110px] flex-1 flex-col gap-1.5">
          <span className="text-[12px] text-text-4">Nome</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-[10px] border border-divider bg-surface-2 px-3 py-2 text-[13px] text-text outline-none"
          />
        </label>
        <label className="flex w-28 flex-col gap-1.5">
          <span className="text-[12px] text-text-4">Cai por mês</span>
          <input
            value={credit}
            onChange={(e) => setCredit(e.target.value)}
            inputMode="decimal"
            placeholder="0,00"
            className="w-full rounded-[10px] border border-divider bg-surface-2 px-3 py-2 text-right font-mono text-[13px] text-text outline-none placeholder:text-text-4"
          />
        </label>
        <label className="flex w-16 flex-col gap-1.5">
          <span className="text-[12px] text-text-4">Dia</span>
          <input
            value={day}
            onChange={(e) => setDay(e.target.value)}
            inputMode="numeric"
            className="w-full rounded-[10px] border border-divider bg-surface-2 px-3 py-2 text-center font-mono text-[13px] text-text outline-none"
          />
        </label>
        <label className={cn("flex w-28 flex-col gap-1.5", editando && "hidden")}>
          <span className="text-[12px] text-text-4">Tem hoje</span>
          <input
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            inputMode="decimal"
            placeholder="0,00"
            className="w-full rounded-[10px] border border-divider bg-surface-2 px-3 py-2 text-right font-mono text-[13px] text-text outline-none placeholder:text-text-4"
          />
        </label>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={create.isPending || update.isPending}
          className="flex items-center gap-1.5 rounded-[10px] bg-brand px-4 py-2 text-[13px] font-semibold text-brand-ink transition-opacity disabled:opacity-50"
        >
          {editando && <Check className="size-4" />}
          {editando ? "Salvar" : "Cadastrar"}
        </button>

        {editando && (
          <button
            type="button"
            onClick={limpar}
            className="flex items-center gap-1.5 rounded-[10px] border border-divider px-3 py-2 text-[13px] text-text-3 transition-colors hover:text-text"
          >
            <X className="size-4" />
            Cancelar
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-col">
        {(wallets.data ?? []).map((wallet) => (
          <div key={wallet.id} className="flex flex-wrap items-center gap-3 border-b border-divider py-3 last:border-b-0">
            <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
              <span className="truncate text-[13px] text-text">{wallet.name}</span>
              <span className="text-[12px] text-text-4">
                {formatCurrency(wallet.monthlyCredit)} no dia {wallet.creditDay} · saldo{" "}
                {formatCurrency(wallet.balance)}
              </span>
            </div>

            <label className="flex flex-none items-center gap-2">
              <span className="text-[11px] text-text-5">Corrigir saldo</span>
              <input
                defaultValue=""
                onBlur={(e) => {
                  if (e.target.value) {
                    handleAdjust(wallet, e.target.value);
                    e.target.value = "";
                  }
                }}
                inputMode="decimal"
                placeholder="R$"
                aria-label={`Corrigir saldo de ${wallet.name}`}
                className="w-24 rounded-lg border border-divider bg-surface-2 px-2 py-1 text-right font-mono text-[13px] text-text outline-none placeholder:text-text-4"
              />
            </label>

            <button
              type="button"
              onClick={() => abrirEdicao(wallet)}
              aria-label={`Editar ${wallet.name}`}
              className="flex size-11 flex-none items-center justify-center rounded-[10px] text-text-5 transition-colors hover:bg-surface-2 hover:text-text md:size-9"
            >
              <Pencil className="size-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setDeleting(wallet)}
              aria-label={`Excluir ${wallet.name}`}
              className="flex size-11 flex-none items-center justify-center rounded-[10px] transition-colors md:size-9 text-text-5 hover:bg-negative-tint hover:text-negative"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}

        {wallets.data?.length === 0 && (
          <p className="py-6 text-center text-[12px] text-text-4">
            Nenhum benefício cadastrado. Informe quanto cai por mês e quanto tem hoje — o app credita sozinho todo
            mês, sem você precisar lançar nada.
          </p>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir benefício"
        description="As despesas já lançadas continuam no histórico, mas voltam a contar como dinheiro da conta."
        onConfirm={handleDelete}
      />
    </div>
  );
}
