"use client";

import { createContext, useContext, useState, useCallback } from "react";

export interface BookingFormData {
  agreed: boolean;
  name: string;
  nif: string;
  utilityBillFiles: File[];
  incomeReceiptFiles: File[];
}

interface BookingFormContextValue {
  data: BookingFormData;
  updateData: (partial: Partial<BookingFormData>) => void;
}

const BookingFormContext = createContext<BookingFormContextValue | null>(null);

const initialData: BookingFormData = {
  agreed: false,
  name: "",
  nif: "",
  utilityBillFiles: [],
  incomeReceiptFiles: [],
};

export function BookingFormProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<BookingFormData>(initialData);

  const updateData = useCallback((partial: Partial<BookingFormData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <BookingFormContext.Provider value={{ data, updateData }}>
      {children}
    </BookingFormContext.Provider>
  );
}

export function useBookingForm(): BookingFormContextValue {
  const ctx = useContext(BookingFormContext);
  if (!ctx) throw new Error("useBookingForm must be used within BookingFormProvider");
  return ctx;
}
