import { z } from "zod";

export const recurringBillFormSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  expectedAmount: z.coerce.number().positive("Informe um valor maior que zero"),
  dueDay: z.coerce.number().int().min(1, "Dia deve estar entre 1 e 31").max(31, "Dia deve estar entre 1 e 31"),
  category: z.string().min(1, "Informe a categoria"),
});

export type RecurringBillFormInput = z.input<typeof recurringBillFormSchema>;
export type RecurringBillFormValues = z.output<typeof recurringBillFormSchema>;
