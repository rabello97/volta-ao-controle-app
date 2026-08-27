import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { Chip } from "@/components/Chip";
import { EXPENSE_CATEGORIES } from "@/lib/categories";
import type { RecurringBillInput } from "@/api/recurringBills";
import {
  recurringBillFormSchema as schema,
  type RecurringBillFormInput as FormInput,
  type RecurringBillFormValues as FormValues,
} from "@/lib/validators/recurringBillSchema";

interface EditableBill {
  name: string;
  expectedAmount: number | string;
  dueDay: number;
  category: string;
}

interface RecurringBillFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill?: EditableBill | null;
  onSubmit: (input: RecurringBillInput) => Promise<void>;
  isSubmitting: boolean;
}

export function RecurringBillFormDialog({
  open,
  onOpenChange,
  bill,
  onSubmit,
  isSubmitting,
}: RecurringBillFormDialogProps) {
  const [customCategory, setCustomCategory] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", expectedAmount: 0, dueDay: 1, category: "" },
  });

  const category = watch("category");

  useEffect(() => {
    if (open) {
      reset(
        bill
          ? { name: bill.name, expectedAmount: Number(bill.expectedAmount), dueDay: bill.dueDay, category: bill.category }
          : { name: "", expectedAmount: 0, dueDay: 1, category: "" },
      );
      setCustomCategory(Boolean(bill && !EXPENSE_CATEGORIES.includes(bill.category)));
    }
  }, [open, bill, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{bill ? "Editar conta recorrente" : "Nova conta recorrente"}</DialogTitle>
          <DialogDescription>Contas fixas mensais, como água, luz ou internet.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Internet, luz, água…" {...register("name")} />
            {errors.name && <span className="text-xs text-negative">{errors.name.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="expectedAmount">Valor esperado</Label>
              <Input id="expectedAmount" type="number" step="0.01" {...register("expectedAmount")} />
              {errors.expectedAmount && (
                <span className="text-xs text-negative">{errors.expectedAmount.message}</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dueDay">Dia do vencimento</Label>
              <Input id="dueDay" type="number" min={1} max={31} {...register("dueDay")} />
              {errors.dueDay && <span className="text-xs text-negative">{errors.dueDay.message}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Categoria</Label>
            {customCategory ? (
              <Input placeholder="moradia, assinaturas…" {...register("category")} />
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {EXPENSE_CATEGORIES.map((preset) => (
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
