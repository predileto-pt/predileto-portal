import { z } from "zod";

export const agreementSchema = z.object({
  agreed: z.literal(true, {
    message: "You must accept the terms",
  }),
});

export type AgreementFormData = z.infer<typeof agreementSchema>;

export const personalInfoSchema = z.object({
  name: z.string().min(1, "nameRequired"),
  nif: z.string().min(6, "nifMinLength"),
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
