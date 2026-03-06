"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDictionary } from "@/components/dictionary-provider";
import { useBookingForm } from "./booking-form-context";
import { personalInfoSchema, type PersonalInfoFormData } from "./booking-schemas";

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step2PersonalInfo({ onNext, onBack }: Step2Props) {
  const dict = useDictionary();
  const d = dict.booking as Record<string, string>;
  const { data, updateData } = useBookingForm();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: { name: data.name, nif: data.nif },
  });

  const onSubmit = (formData: PersonalInfoFormData) => {
    updateData(formData);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto space-y-6">
      <h1 className="text-xl font-bold">{d.stepPersonalInfo}</h1>

      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          {d.nameLabel}
        </label>
        <input
          id="name"
          {...register("name")}
          placeholder={d.namePlaceholder}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.name && (
          <p className="text-xs text-red-500">{d[errors.name.message as string] || errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="nif" className="block text-sm font-medium text-gray-700">
          {d.nifLabel}
        </label>
        <input
          id="nif"
          {...register("nif")}
          placeholder={d.nifPlaceholder}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.nif && (
          <p className="text-xs text-red-500">{d[errors.nif.message as string] || errors.nif.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-2.5 px-4 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          {d.back}
        </button>
        <button
          type="submit"
          className="flex-1 py-2.5 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {d.continue}
        </button>
      </div>
    </form>
  );
}
