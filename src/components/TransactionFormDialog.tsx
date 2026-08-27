import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Chip } from "@/components/Chip";
import { useCreditCards } from "@/hooks/useCreditCards";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";
import type { Transaction } from "@/api/types";
import type { TransactionInput } from "@/api/transactions";
import {
  transactionFormSchema as schema,
  type TransactionFormInput as FormInput,
  type TransactionFormValues as FormValues,
} from "@/lib/validators/transactionSchema";

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
  onSubmit: (input: TransactionInput) => Promise<void>;
  isSubmitting: boolean;
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
  onSubmit,
  isSubmitting,
}: TransactionFormDialogProps) {
  const { data: cards } = useCreditCards();
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

  const type = watch("type");
  const category = watch("category");
  const creditCardId = watch("creditCardId");
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
            }
          : { type: "EXPENSE", amount: 0, date: "", category: "", description: "" },
      );
      setCustomCategory(Boolean(transaction && !EXPENSE_CATEGORIES.concat(INCOME_CATEGORIES).includes(transaction.category)));
    }
  }, [open, transaction, reset]);

  async function handleFormSubmit(values: FormValues) {
    await onSubmit({
      type: values.type,
      amount: values.amount,
      date: values.date,
      category: values.category,
      description: values.description || undefined,
      creditCardId: values.type === "EXPENSE" ? values.creditCardId || undefined : undefined,
      invoiceChoice: values.type === "EXPENSE" ? values.invoiceChoice : undefined,
      installmentTotal: values.type === "EXPENSE" && values.creditCardId ? values.installmentTotal : undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction ? "Editar transação" : "Nova transação"}</DialogTitle>
          <DialogDescription>Registre uma entrada ou saída.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-3.5">
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Tabs value={field.value} onValueChange={field.onChange}>
                <TabsList className="w-full">
                  <TabsTrigger value="EXPENSE" className="flex-1">
                    Saída
                  </TabsTrigger>
                  <TabsTrigger value="INCOME" className="flex-1">
                    Entrada
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Valor</Label>
              <Input id="amount" type="number" step="0.01" {...register("amount")} />
              {errors.amount && <span className="text-xs text-negative">{errors.amount.message}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && <span className="text-xs text-negative">{errors.date.message}</span>}
            </div>
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
                    {preset}
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

          {type === "EXPENSE" && (
            <div className="flex flex-col gap-3 rounded-xl bg-track p-3">
              <div className="flex flex-col gap-1.5">
                <Label>Cartão (opcional)</Label>
                <Controller
                  control={control}
                  name="creditCardId"
                  render={({ field }) => (
                    <Select value={field.value ?? "none"} onValueChange={(v) => field.onChange(v === "none" ? undefined : v)}>
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
                        <Tabs value={field.value ?? ""} onValueChange={field.onChange}>
                          <TabsList className="w-full">
                            <TabsTrigger value="CURRENT" className="flex-1">
                              Atual
                            </TabsTrigger>
                            <TabsTrigger value="NEXT" className="flex-1">
                              Próxima
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      )}
                    />
                    {errors.invoiceChoice && (
                      <span className="text-xs text-negative">{errors.invoiceChoice.message}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="installmentTotal">Parcelas (opcional)</Label>
                    <Input id="installmentTotal" type="number" min={1} max={24} placeholder="1" {...register("installmentTotal")} />
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
