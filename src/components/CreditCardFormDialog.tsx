import { useEffect } from "react";
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
import type { CreditCardInput } from "@/api/creditCards";
import {
  creditCardFormSchema as schema,
  type CreditCardFormInput as FormInput,
  type CreditCardFormValues as FormValues,
} from "@/lib/validators/creditCardSchema";

interface CreditCardFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreditCardInput) => Promise<void>;
  isSubmitting: boolean;
}

export function CreditCardFormDialog({ open, onOpenChange, onSubmit, isSubmitting }: CreditCardFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nickname: "", closingDay: 1, dueDay: 10 },
  });

  useEffect(() => {
    if (open) reset({ nickname: "", closingDay: 1, dueDay: 10 });
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo cartão</DialogTitle>
          <DialogDescription>Cadastre um cartão de crédito para vincular transações.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nickname">Apelido</Label>
            <Input id="nickname" placeholder="Nubank, Inter…" {...register("nickname")} />
            {errors.nickname && <span className="text-xs text-negative">{errors.nickname.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="closingDay">Dia de fechamento</Label>
              <Input id="closingDay" type="number" min={1} max={31} {...register("closingDay")} />
              {errors.closingDay && <span className="text-xs text-negative">{errors.closingDay.message}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dueDay">Dia de vencimento</Label>
              <Input id="dueDay" type="number" min={1} max={31} {...register("dueDay")} />
              {errors.dueDay && <span className="text-xs text-negative">{errors.dueDay.message}</span>}
            </div>
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
