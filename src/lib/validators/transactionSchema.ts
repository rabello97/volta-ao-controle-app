import { z } from "zod";

export const transactionFormSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z.coerce.number().positive("Informe um valor maior que zero"),
    date: z.string().min(1, "Informe a data"),
    category: z.string().min(1, "Informe a categoria"),
    description: z.string().optional(),
    creditCardId: z.string().optional(),
    invoiceChoice: z.enum(["CURRENT", "NEXT"]).optional(),
    installmentTotal: z.coerce.number().int().min(1).max(24).optional(),
    walletId: z.string().optional(),
  })
  .refine((data) => !data.creditCardId || Boolean(data.invoiceChoice), {
    message: "Escolha a fatura atual ou a próxima",
    path: ["invoiceChoice"],
  })
  // Ou sai do benefício, ou vai para o cartão — os dois juntos não existem.
  .refine((data) => !(data.walletId && data.creditCardId), {
    message: "Escolha o benefício ou o cartão, não os dois",
    path: ["walletId"],
  });

export type TransactionFormInput = z.input<typeof transactionFormSchema>;
export type TransactionFormValues = z.output<typeof transactionFormSchema>;
