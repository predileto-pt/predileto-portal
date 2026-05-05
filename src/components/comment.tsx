"use client";

import { cn } from "@/lib/utils";

export interface CommentData {
  id: string;
  content: string;
  at: number;
}

interface CommentProps {
  comment: CommentData;
  className?: string;
}

export function Comment({ comment, className }: CommentProps) {
  return (
    <li className={cn("flex gap-3 py-4", className)}>
      <AnonymousAvatar />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-heading font-bold text-ink">
            Anônimo
          </span>
          <span className="text-xs text-ink-muted">
            {formatRelative(comment.at)}
          </span>
        </div>
        <p className="text-sm text-ink leading-body whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>
    </li>
  );
}

function AnonymousAvatar() {
  return (
    <div
      aria-hidden
      className="w-8 h-8 shrink-0 rounded-full bg-paper-muted border border-rule flex items-center justify-center text-ink-subtle"
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4 h-4"
      >
        <path
          fillRule="evenodd"
          d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}

function formatRelative(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const sec = Math.max(0, Math.floor(diff / 1000));
  if (sec < 60) return "agora";
  const min = Math.floor(sec / 60);
  if (min < 60) return `há ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `há ${hr} h`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `há ${day} ${day === 1 ? "dia" : "dias"}`;
  const month = Math.floor(day / 30);
  if (month < 12) return `há ${month} ${month === 1 ? "mês" : "meses"}`;
  return "há mais de 1 ano";
}
