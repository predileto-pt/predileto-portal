"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDictionary } from "@/components/dictionary-provider";
import { useBookingForm } from "./booking-form-context";
import { agreementSchema, type AgreementFormData } from "./booking-schemas";

interface Step1Props {
  onNext: () => void;
}

export function Step1Agreement({ onNext }: Step1Props) {
  const dict = useDictionary();
  const d = dict.booking as Record<string, string>;
  const { data, updateData } = useBookingForm();

  const { register, handleSubmit, watch } = useForm<AgreementFormData>({
    resolver: zodResolver(agreementSchema),
    defaultValues: { agreed: data.agreed || undefined },
  });

  const agreed = watch("agreed");

  const onSubmit = (formData: AgreementFormData) => {
    updateData({ agreed: formData.agreed });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto space-y-6">
      <h1 className="text-xl font-bold">{d.agreementTitle}</h1>
      <p className="text-sm text-gray-600 whitespace-pre-line">{d.agreementText}</p>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          {...register("agreed")}
          className="mt-0.5 size-4 rounded border-gray-300"
        />
        <span className="text-sm">{d.agreementCheckbox}</span>
      </label>

      <button
        type="submit"
        disabled={!agreed}
        className="w-full py-2.5 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
      >
        {d.continue}
      </button>
    </form>
  );
}
