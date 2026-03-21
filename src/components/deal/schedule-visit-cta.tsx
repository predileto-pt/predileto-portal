"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { tracking } from "@/lib/tracking";

interface ScheduleVisitCTAProps {
  propertyId: string;
  dict: Record<string, string>;
}

export function ScheduleVisitCTA({ propertyId, dict }: ScheduleVisitCTAProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    tracking.trackScheduleVisit(propertyId, { name, phone, preferredDate });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="border border-green-200 bg-green-50 p-4 space-y-2">
        <div className="flex items-center gap-2 text-green-700">
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <p className="text-sm font-medium">{dict.visitRequestSent}</p>
        </div>
        <p className="text-xs text-green-600">
          {dict.visitRequestConfirmation}
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 border border-gray-200 hover:border-gray-300 p-4 transition-colors group cursor-pointer"
      >
        <div className="flex size-10 items-center justify-center bg-blue-50 text-blue-600 shrink-0">
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <div className="text-left">
          <p className="text-sm font-medium group-hover:text-blue-600 transition-colors">
            {dict.scheduleVisitAction}
          </p>
          <p className="text-xs text-gray-400">{dict.scheduleVisitDesc}</p>
        </div>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-blue-200 bg-blue-50/30 p-4 space-y-3">
      <h4 className="text-sm font-medium">{dict.scheduleVisitAction}</h4>
      <div>
        <label htmlFor="sv-name" className="block text-xs text-gray-500 mb-1">{dict.fullName}</label>
        <input
          id="sv-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
          placeholder={dict.yourName}
        />
      </div>
      <div>
        <label htmlFor="sv-phone" className="block text-xs text-gray-500 mb-1">{dict.phone}</label>
        <input
          id="sv-phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
          placeholder="+351 9XX XXX XXX"
        />
      </div>
      <div>
        <label htmlFor="sv-date" className="block text-xs text-gray-500 mb-1">{dict.preferredDate}</label>
        <input
          id="sv-date"
          type="date"
          value={preferredDate}
          onChange={(e) => setPreferredDate(e.target.value)}
          className="w-full border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="primary">{dict.sendRequest}</Button>
        <Button type="button" variant="default" onClick={() => setOpen(false)}>{dict.cancel}</Button>
      </div>
    </form>
  );
}
