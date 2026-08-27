import { z } from "zod";

export const creditCardFormSchema = z
  .object({
    nickname: z.string().min(1, "Informe um apelido"),
    closingDay: z.coerce.number().int().min(1, "Dia deve estar entre 1 e 31").max(31, "Dia deve estar entre 1 e 31"),
    dueDay: z.coerce.number().int().min(1, "Dia deve estar entre 1 e 31").max(31, "Dia deve estar entre 1 e 31"),
    creditLimit: z.coerce.number().positive("Limite deve ser positivo").optional().or(z.literal("").transform(() => undefined)),
  })
  .refine((data) => data.closingDay < data.dueDay, {
    message: "O fechamento deve ser antes do vencimento",
    path: ["dueDay"],
  });

export type CreditCardFormInput = z.input<typeof creditCardFormSchema>;
export type CreditCardFormValues = z.output<typeof creditCardFormSchema>;
