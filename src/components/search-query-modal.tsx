"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SearchQueryModalProps {
  open: boolean;
  initialQuery: string;
  placeholder: string;
  onSubmit: (query: string) => void;
  onClose: () => void;
}

export function SearchQueryModal(props: SearchQueryModalProps) {
  if (!props.open) return null;
  // Remount the inner editor whenever the modal re-opens so it picks up the
  // current `initialQuery` without an effect-based sync.
  return <ModalBody key={props.initialQuery} {...props} />;
}

function ModalBody({
  initialQuery,
  placeholder,
  onSubmit,
  onClose,
}: SearchQueryModalProps) {
  const [canSubmit, setCanSubmit] = useState(initialQuery.trim().length > 0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 0);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function submit() {
    const value = textareaRef.current?.value.trim() ?? "";
    if (value.length === 0) return;
    onSubmit(value);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-32 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Editar pesquisa"
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm cursor-default"
      />
      <div
        className={cn(
          "relative w-full max-w-2xl bg-paper border border-rule shadow-xl",
          "p-3",
        )}
        style={{ borderRadius: 24 }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="grid grid-cols-[1fr_auto] items-end gap-2"
        >
          <textarea
            ref={textareaRef}
            defaultValue={initialQuery}
            onChange={(e) =>
              setCanSubmit(e.target.value.trim().length > 0)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={placeholder}
            rows={3}
            aria-label="Descreva o que procura"
            className="w-full resize-none bg-transparent outline-none leading-body placeholder:text-ink-muted overflow-auto py-2 px-3 text-base max-h-60"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <button
            type="submit"
            disabled={!canSubmit}
            aria-label="Pesquisar"
            className="rounded-full bg-ink text-paper flex items-center justify-center shrink-0 disabled:opacity-30 hover:opacity-80 transition-opacity h-9 w-9 cursor-pointer disabled:cursor-not-allowed"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </form>
        <p className="px-3 pt-2 text-[11px] text-ink-muted">
          Enter para pesquisar · Shift+Enter para nova linha · Esc para fechar
        </p>
      </div>
    </div>
  );
}
