"use client";

import { useDictionary } from "@/components/dictionary-provider";
import { useBookingForm } from "./booking-form-context";
import { FileDropzone } from "./file-dropzone";

interface Step3Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step3Documents({ onNext, onBack }: Step3Props) {
  const dict = useDictionary();
  const d = dict.booking as Record<string, string>;
  const { data, updateData } = useBookingForm();

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-xl font-bold">{d.stepDocuments}</h1>

      <FileDropzone
        label={d.utilityBillLabel}
        description={d.utilityBillDescription}
        files={data.utilityBillFiles}
        onFilesChange={(files) => updateData({ utilityBillFiles: files })}
        maxFiles={1}
        dropzoneText={d.dropzoneText}
        dropzoneActiveText={d.dropzoneActiveText}
      />

      <FileDropzone
        label={d.incomeReceiptsLabel}
        description={d.incomeReceiptsDescription}
        files={data.incomeReceiptFiles}
        onFilesChange={(files) => updateData({ incomeReceiptFiles: files })}
        maxFiles={3}
        dropzoneText={d.dropzoneText}
        dropzoneActiveText={d.dropzoneActiveText}
      />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-2.5 px-4 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          {d.back}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-2.5 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {d.continue}
        </button>
      </div>
    </div>
  );
}
