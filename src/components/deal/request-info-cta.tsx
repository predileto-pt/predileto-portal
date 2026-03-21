"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { tracking } from "@/lib/tracking";

interface RequestInfoCTAProps {
  propertyId: string;
  dict: Record<string, string>;
}

export function RequestInfoCTA({ propertyId, dict }: RequestInfoCTAProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");

  const topics = [
    { value: "pricing", label: dict.topicPricing },
    { value: "neighborhood", label: dict.topicNeighborhood },
    { value: "financing", label: dict.topicFinancing },
    { value: "documentation", label: dict.topicDocumentation },
    { value: "availability", label: dict.topicAvailability },
    { value: "other", label: dict.topicOther },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    tracking.trackRequestInfo(propertyId, { topic, message });
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
          <p className="text-sm font-medium">{dict.infoRequestSent}</p>
        </div>
        <p className="text-xs text-green-600">
          {dict.infoRequestConfirmation}
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
        <div className="flex size-10 items-center justify-center bg-emerald-50 text-emerald-600 shrink-0">
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div className="text-left">
          <p className="text-sm font-medium group-hover:text-emerald-600 transition-colors">
            {dict.requestInfo}
          </p>
          <p className="text-xs text-gray-400">{dict.requestInfoDesc}</p>
        </div>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-emerald-200 bg-emerald-50/30 p-4 space-y-3">
      <h4 className="text-sm font-medium">{dict.requestInfo}</h4>
      <div>
        <label htmlFor="ri-topic" className="block text-xs text-gray-500 mb-1">{dict.topic}</label>
        <select
          id="ri-topic"
          required
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-400 bg-white"
        >
          <option value="">{dict.selectTopic}</option>
          {topics.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="ri-message" className="block text-xs text-gray-500 mb-1">{dict.messageOptional}</label>
        <textarea
          id="ri-message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-400 resize-none"
          placeholder={dict.messagePlaceholder}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="primary">{dict.sendRequest}</Button>
        <Button type="button" variant="default" onClick={() => setOpen(false)}>{dict.cancel}</Button>
      </div>
    </form>
  );
}
