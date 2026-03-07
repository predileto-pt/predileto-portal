"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDictionary } from "@/components/dictionary-provider";
import { useBookingForm } from "./booking-form-context";
import { contactInfoSchema, type ContactInfoFormData } from "./booking-schemas";
import { Select } from "@/components/ui/select";
import { countryOptions } from "@/lib/countries";

interface Step3Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step3ContactInfo({ onNext, onBack }: Step3Props) {
  const dict = useDictionary();
  const d = dict.booking as Record<string, string>;
  const { data, updateData } = useBookingForm();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ContactInfoFormData>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      email: data.email,
      phoneCountryCode: data.phoneCountryCode,
      phone: data.phone,
    },
  });

  const onSubmit = (formData: ContactInfoFormData) => {
    updateData(formData);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto space-y-6">
      <h1 className="text-xl font-bold">{d.stepContactInfo}</h1>

      <div className="space-y-1">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          {d.phoneLabel}
        </label>
        <div className="flex gap-2">
          <Controller
            name="phoneCountryCode"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                options={countryOptions}
                ariaLabel={d.countryCodeLabel}
                className="w-28 rounded-lg py-2"
              />
            )}
          />
          <input
            id="phone"
            type="tel"
            {...register("phone")}
            placeholder={d.phonePlaceholder}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {errors.phone && (
          <p className="text-xs text-red-500">{d[errors.phone.message as string] || errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          {d.emailLabel}
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          placeholder={d.emailPlaceholder}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.email && (
          <p className="text-xs text-red-500">{d[errors.email.message as string] || errors.email.message}</p>
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
