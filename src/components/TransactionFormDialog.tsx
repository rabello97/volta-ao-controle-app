import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Chip } from "@/components/Chip";
import { useHouseholdView } from "@/context/HouseholdViewContext";
import { formatCurrency, formatCategory } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCreditCards } from "@/hooks/useCreditCards";
import { useWallets } from "@/hooks/useWallets";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import type { Transaction } from "@/api/types";
import type { TransactionFormPayload } from "@/api/transactions";
import {
  transactionFormSchema as schema,
  type TransactionFormInput as FormInput,
  type TransactionFormValues as FormValues,
} from "@/lib/validators/transactionSchema";

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
  /** Valores iniciais para uma transação nova — usado pela leitura de nota e
   *  print, que abre o formulário já preenchido para o usuário conferir. */
  draft?: Partial<FormInput> | null;
  onSubmit: (input: TransactionFormPayload) => Promise<void>;
  isSubmitting: boolean;
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
  draft,
  onSubmit,
  isSubmitting,
}: TransactionFormDialogProps) {
  const { data: cards } = useCreditCards();
  const { data: wallets } = useWallets();
  const [customCategory, setCustomCategory] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "EXPENSE", amount: 0, date: "", category: "", description: "" },
  });

  // Só faz sentido oferecer transferência e "veio do parceiro" quando existe
  // parceiro vinculado.
  const { partner: parceiro } = useHouseholdView();
  const type = watch("type");
  const category = watch("category");
  const creditCardId = watch("creditCardId");
  const walletId = watch("walletId");
  const presets = type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    if (open) {
      reset(
        transaction
          ? {
              type: transaction.type,
              amount: Number(transaction.amount),
              date: transaction.date.slice(0, 10),
              category: transaction.category,
              description: transaction.description ?? "",
              creditCardId: transaction.creditCardId ?? undefined,
              invoiceChoice: transaction.creditCardId ? "CURRENT" : undefined,
            }
          : { type: "EXPENSE", amount: 0, date: "", category: "", description: "", ...draft },
      );
      const categoriaAtual = transaction?.category ?? draft?.category;
      setCustomCategory(
        Boolean(categoriaAtual && !EXPENSE_CATEGORIES.concat(INCOME_CATEGORIES).includes(categoriaAtual)),
      );
    }
  }, [open, transaction, reset]);

  async function handleFormSubmit(values: FormValues) {
    await onSubmit({
      type: values.type,
      amount: values.amount,
      date: values.date,
      category: values.category,
      description: values.description || undefined,
      walletId: values.type === "EXPENSE" ? values.walletId || undefined : undefined,
      creditCardId: values.type === "EXPENSE" ? (values.creditCardId || (transaction ? null : undefined)) : undefined,
      invoiceChoice: values.type === "EXPENSE" ? values.invoiceChoice : undefined,
      // Parcelamento só na criação: mudar depois exigiria refazer as parcelas.
      installmentTotal:
        !transaction && values.type === "EXPENSE" && values.creditCardId ? values.installmentTotal : undefined,
      transferPeerUserId: values.transferPeerUserId || undefined,
      moneySource: values.type === "INCOME" ? values.moneySource : undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="gap-0 p-0 sm:max-w-[520px] sm:rounded-[26px]">
        {/* Cabeçalho escuro com o valor em destaque: o valor é o único campo
            que a pessoa sempre digita, então ele lidera em vez de dividir uma
            linha com a data. */}
        <div className="rounded-t-2xl bg-[image:var(--spot)] px-5 py-5 text-spot-fg sm:rounded-t-[26px] sm:px-6">
          <DialogHeader className="flex-row items-center gap-3 space-y-0">
            <DialogTitle className="text-[16px] font-semibold text-spot-fg">
              {transaction ? "Editar transação" : "Nova transação"}
            </DialogTitle>
            <DialogDescription className="sr-only">Registre uma entrada ou saída.</DialogDescription>
            <DialogClose
              aria-label="Fechar"
              className="ml-auto flex size-8 items-center justify-center rounded-full text-spot-fg-2 transition-colors hover:bg-white/15 hover:text-spot-fg"
            >
              <X className="size-4" />
            </DialogClose>
          </DialogHeader>

          <div className="mt-4 flex items-baseline gap-2.5">
            <span className="text-[17px] font-medium text-spot-fg-2">R$</span>
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              step="0.01"
              placeholder="0,00"
              autoComplete="off"
              {...register("amount")}
              className="w-full min-w-0 bg-transparent font-mono text-[38px] font-semibold -tracking-[0.03em] tabular-nums text-spot-fg outline-none placeholder:text-spot-fg-2/50"
            />
          </div>
          {errors.amount && <span className="text-xs text-warning">{errors.amount.message}</span>}

          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <div className="mt-4 grid grid-cols-2 gap-[3px] rounded-[11px] bg-black/25 p-[3px]">
                {(
                  [
                    { value: "EXPENSE", label: "Saída" },
                    { value: "INCOME", label: "Entrada" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={field.value === opt.value}
                    onClick={() => field.onChange(opt.value)}
                    className={cn(
                      "rounded-[9px] py-2 text-[13.5px] font-semibold transition-colors",
                      field.value === opt.value
                        ? "bg-spot-accent text-side-accent-ink"
                        : "text-spot-fg-2 hover:text-spot-fg",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-3.5 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date">Data</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && <span className="text-xs text-negative">{errors.date.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Categoria</Label>
            {customCategory ? (
              <Input placeholder="mercado, lazer, salário…" {...register("category")} />
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {presets.map((preset) => (
                  <Chip
                    key={preset}
                    type="button"
                    selected={category === preset}
                    onClick={() => setValue("category", preset, { shouldValidate: true })}
                  >
                    {formatCategory(preset)}
                  </Chip>
                ))}
                <Chip type="button" onClick={() => setCustomCategory(true)}>
                  + nova
                </Chip>
              </div>
            )}
            {errors.category && <span className="text-xs text-negative">{errors.category.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input id="description" {...register("description")} />
          </div>

          {/* Origem do dinheiro: sem isso, empréstimo entra no painel como sobra
              e o número que responde "posso gastar?" mente. */}
          {type === "INCOME" && (
            <div className="flex flex-col gap-1.5">
              <Label>De onde veio esse dinheiro?</Label>
              <Controller
                control={control}
                name="moneySource"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { value: "OWN", label: "Meu dinheiro" },
                      ...(parceiro ? [{ value: "PARTNER", label: `Veio d${parceiro.name.split(" ")[0].endsWith("a") ? "a" : "o"} ${parceiro.name.split(" ")[0]}` }] : []),
                      { value: "CARD_LOAN", label: "Empréstimo/Pix do cartão" },
                      { value: "OVERDRAFT", label: "Cheque especial" },
                      { value: "OTHER_LOAN", label: "Outro empréstimo" },
                    ].map((o) => (
                      <Chip
                        key={o.value}
                        type="button"
                        selected={field.value === o.value}
                        onClick={() => {
                          field.onChange(o.value);
                          setValue("transferPeerUserId", o.value === "PARTNER" ? parceiro?.id : undefined);
                        }}
                      >
                        {o.label}
                      </Chip>
                    ))}
                  </div>
                )}
              />
              {watch("moneySource") === "PARTNER" && parceiro && (
                <span className="text-[12px] leading-[1.45] text-text-4">
                  {parceiro.name.split(" ")[0]} vai receber um aviso para dizer de onde saiu — se do salário ou de
                  empréstimo. Até lá, o painel trata como emprestado.
                </span>
              )}
            </div>
          )}

          {/* Transferência: dinheiro que só mudou de bolso não é gasto da casa. */}
          {type === "EXPENSE" && parceiro && (
            <div className="flex flex-col gap-1.5">
              <Controller
                control={control}
                name="transferPeerUserId"
                render={({ field }) => (
                  <label className="flex items-start gap-2.5 rounded-[13px] border border-divider bg-surface-inset px-3.5 py-3 text-[13px] leading-[1.45] text-text-3">
                    <input
                      type="checkbox"
                      checked={field.value === parceiro.id}
                      onChange={(e) => field.onChange(e.target.checked ? parceiro.id : undefined)}
                      className="mt-0.5 size-4 flex-none accent-[var(--brand)]"
                    />
                    <span>
                      É transferência para {parceiro.name.split(" ")[0]}
                      <span className="block text-[12px] text-text-4">
                        Não conta como gasto da casa — o dinheiro só mudou de bolso.
                      </span>
                    </span>
                  </label>
                )}
              />
            </div>
          )}

          {type === "EXPENSE" && (wallets?.length ?? 0) > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>Pago com benefício (opcional)</Label>
              <Controller
                control={control}
                name="walletId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(v) => {
                      field.onChange(v === "none" ? undefined : v);
                      // Benefício e cartão são excludentes: o dinheiro sai de um só.
                      if (v !== "none") {
                        setValue("creditCardId", undefined);
                        setValue("invoiceChoice", undefined);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Saiu da conta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Saiu da conta</SelectItem>
                      {wallets?.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name} · {formatCurrency(wallet.balance)} disponíveis
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {type === "EXPENSE" && !walletId && (
            <div className="flex flex-col gap-3.5 rounded-[14px] border border-divider bg-surface-inset p-3.5">
              <div className="flex flex-col gap-1.5">
                <Label>Cartão (opcional)</Label>
                <Controller
                  control={control}
                  name="creditCardId"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? "none"}
                      onValueChange={(v) => {
                        const id = v === "none" ? undefined : v;
                        field.onChange(id);
                        // A fatura é obrigatória quando há cartão. Sem este
                        // padrão nenhuma das duas opções vinha marcada e o
                        // salvamento parava na validação do servidor.
                        setValue("invoiceChoice", id ? "CURRENT" : undefined, { shouldValidate: true });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Nenhum" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {cards?.map((card) => (
                          <SelectItem key={card.id} value={card.id}>
                            {card.nickname}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {creditCardId && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label>Fatura</Label>
                    <Controller
                      control={control}
                      name="invoiceChoice"
                      render={({ field }) => (
                        /* Segmentado próprio em vez do Tabs do shadcn: a lista
                           dele é `bg-muted` (= --track) e a aba ativa é
                           `bg-background` — dentro deste bloco os três cinzas
                           ficavam iguais e o controle sumia. */
                        <div className="grid grid-cols-2 gap-[3px] rounded-[11px] bg-track p-[3px]">
                          {(
                            [
                              { value: "CURRENT", label: "Atual" },
                              { value: "NEXT", label: "Próxima" },
                            ] as const
                          ).map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              aria-pressed={field.value === opt.value}
                              onClick={() => field.onChange(opt.value)}
                              className={cn(
                                "rounded-[9px] py-2 text-[13.5px] transition-colors",
                                field.value === opt.value
                                  ? "bg-surface font-semibold text-text shadow-[var(--shadow-card)]"
                                  : "text-text-4 hover:text-text",
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    />
                    {errors.invoiceChoice && (
                      <span className="text-xs text-negative">{errors.invoiceChoice.message}</span>
                    )}
                  </div>

                  {!transaction && (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="installmentTotal">Parcelas</Label>
                      {/* Atalhos para os parcelamentos que mais aparecem — no
                          celular, digitar "12" num campo numérico é pior que
                          tocar em "12×". O campo continua aceitando qualquer
                          valor até 24. */}
                      <Controller
                        control={control}
                        name="installmentTotal"
                        render={({ field }) => {
                          const atual = String(field.value ?? "1");
                          return (
                            <div className="flex flex-wrap items-center gap-1.5">
                              {["1", "2", "3", "6", "10", "12"].map((n) => (
                                <button
                                  key={n}
                                  type="button"
                                  aria-pressed={atual === n}
                                  onClick={() => field.onChange(n)}
                                  className={cn(
                                    "min-w-11 rounded-full px-3 py-1.5 text-[13px] transition-colors",
                                    atual === n
                                      ? "bg-brand font-semibold text-brand-ink"
                                      : "bg-surface text-text-3 hover:text-text",
                                  )}
                                >
                                  {n === "1" ? "à vista" : `${n}×`}
                                </button>
                              ))}
                              <Input
                                id="installmentTotal"
                                type="text"
                                inputMode="numeric"
                                aria-label="Outro número de parcelas"
                                placeholder="outro"
                                value={atual === "1" ? "" : atual}
                                onChange={(e) => field.onChange(e.target.value || "1")}
                                className="h-9 w-20 bg-surface text-center"
                              />
                            </div>
                          );
                        }}
                      />
                    </div>
                  )}

                  {transaction?.installmentTotal && transaction.installmentTotal > 1 && (
                    <p className="text-[12px] leading-[1.45] text-text-4">
                      Compra parcelada ({transaction.installmentNumber} de {transaction.installmentTotal}). Trocar o
                      cartão move todas as parcelas juntas.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          <DialogFooter className="-mx-5 -mb-5 sm:-mx-6 sm:-mb-5">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
