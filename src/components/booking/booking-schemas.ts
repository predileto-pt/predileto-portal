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

export const contactInfoSchema = z.object({
  email: z.string().min(1, { message: "emailRequired" }).email({ message: "emailInvalid" }),
  phoneCountryCode: z.string().min(1),
  phone: z.string().min(1, { message: "phoneRequired" }),
});

export type ContactInfoFormData = z.infer<typeof contactInfoSchema>;
