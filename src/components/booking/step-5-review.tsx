"use client";

import { useState } from "react";
import { useDictionary } from "@/components/dictionary-provider";
import { useBookingForm } from "./booking-form-context";

interface Step5Props {
  propertyId: string;
  onNext: () => void;
  onBack: () => void;
}

export function Step5Review({ propertyId, onNext, onBack }: Step5Props) {
  const dict = useDictionary();
  const d = dict.booking as Record<string, string>;
  const { data } = useBookingForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    console.log("Booking submission:", {
      propertyId,
      name: data.name,
      nif: data.nif,
      email: data.email,
      phoneCountryCode: data.phoneCountryCode,
      phone: data.phone,
      utilityBillCount: data.utilityBillFiles.length,
      incomeReceiptCount: data.incomeReceiptFiles.length,
    });
    onNext();
  };

  const fileCount = (count: number) =>
    d.reviewFiles.replace("{count}", String(count));

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-xl font-bold">{d.reviewTitle}</h1>

      <dl className="space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500">{d.reviewName}</dt>
          <dd>{data.name}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">{d.reviewNif}</dt>
          <dd>{data.nif}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">{d.reviewEmail}</dt>
          <dd>{data.email}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">{d.reviewPhone}</dt>
          <dd>{data.phoneCountryCode} {data.phone}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">{d.reviewUtilityBill}</dt>
          <dd>
            {data.utilityBillFiles.length > 0
              ? fileCount(data.utilityBillFiles.length)
              : d.reviewNoFiles}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">{d.reviewIncomeReceipts}</dt>
          <dd>
            {data.incomeReceiptFiles.length > 0
              ? fileCount(data.incomeReceiptFiles.length)
              : d.reviewNoFiles}
          </dd>
        </div>
      </dl>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="flex-1 py-2.5 px-4 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
        >
          {d.back}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 py-2.5 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40"
        >
          {submitting ? d.submitting : d.submit}
        </button>
      </div>
    </div>
  );
}
