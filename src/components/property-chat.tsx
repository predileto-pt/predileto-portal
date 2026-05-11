"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn, formatPrice } from "@/lib/utils";
import { Small } from "@/components/ui/small";
import type { SearchResultItem } from "@/components/search-results";

export interface ChatMessage {
  id: string;
  role: "agent" | "user";
  content: string;
  at: number;
}

interface PropertyChatProps {
  property: SearchResultItem | null;
  locale: string;
  open: boolean;
  onClose: () => void;
}

const MOCK_REPLY_DELAY_MS = 700;

/**
 * Per-property agent chat panel. Lives inside the right sidebar above the
 * search history. Auto-opens on first active property detected; can be
 * closed (hides for the session) and reopened from any card's
 * "Falar com agente" action.
 *
 * Conversations are kept per `property.id` so scrolling back to a previous
 * property restores its thread. Greetings are mocked client-side from the
 * property shape — BE will replace this once the agent endpoint lands.
 */
export function PropertyChat({
  property,
  locale,
  open,
  onClose,
}: PropertyChatProps) {
  const [threads, setThreads] = useState<Record<string, ChatMessage[]>>({});
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const propertyId = property?.id ?? null;
  const messages = useMemo<ChatMessage[]>(() => {
    if (!propertyId) return [];
    return threads[propertyId] ?? [];
  }, [threads, propertyId]);

  // Seed a greeting the first time we see a property in the chat.
  useEffect(() => {
    if (!property) return;
    if (threads[property.id]?.length) return;
    const greeting = buildGreeting(property, locale);
    setThreads((prev) => ({
      ...prev,
      [property.id]: [
        {
          id: `${property.id}-agent-greeting`,
          role: "agent",
          content: greeting,
          at: Date.now(),
        },
      ],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property?.id]);

  // Pin the scroll to the bottom whenever the thread grows.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, pending]);

  function sendMessage(text: string) {
    if (!propertyId) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = Date.now();
    setDraft("");
    setThreads((prev) => ({
      ...prev,
      [propertyId]: [
        ...(prev[propertyId] ?? []),
        {
          id: `${propertyId}-user-${now}`,
          role: "user",
          content: trimmed,
          at: now,
        },
      ],
    }));
    setPending(true);
    const fixedPropertyId = propertyId;
    setTimeout(() => {
      setThreads((prev) => ({
        ...prev,
        [fixedPropertyId]: [
          ...(prev[fixedPropertyId] ?? []),
          {
            id: `${fixedPropertyId}-agent-${Date.now()}`,
            role: "agent",
            content: buildMockReply(trimmed),
            at: Date.now(),
          },
        ],
      }));
      setPending(false);
    }, MOCK_REPLY_DELAY_MS);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    sendMessage(draft);
  }

  if (!open || !property) return null;

  return (
    <div className="flex flex-col border border-rule bg-paper rounded-lg shadow-sm overflow-hidden max-h-[60vh]">
      <header className="flex items-center gap-2 px-3 py-2 border-b border-rule">
        <div
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white"
          style={{
            background:
              "linear-gradient(135deg, hsl(172 66% 50%), hsl(38 92% 50%))",
          }}
          aria-hidden
        >
          <SparkleIcon />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold leading-tight">Agente Predileto</p>
          <p className="text-[11px] text-ink-muted truncate leading-tight">
            {property.title}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar conversa"
          className="shrink-0 text-ink-muted hover:text-ink cursor-pointer"
        >
          <XIcon />
        </button>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2.5"
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {pending && (
          <div className="flex items-center gap-1 px-3 py-2 w-fit bg-paper-muted rounded-2xl text-ink-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-ink-muted/60 animate-pulse" />
            <span
              className="w-1.5 h-1.5 rounded-full bg-ink-muted/60 animate-pulse"
              style={{ animationDelay: "120ms" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-ink-muted/60 animate-pulse"
              style={{ animationDelay: "240ms" }}
            />
          </div>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 px-2 py-2 border-t border-rule bg-paper-muted"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Pergunte ao agente…"
          aria-label="Mensagem para o agente"
          className="flex-1 h-8 px-3 text-xs bg-paper border border-rule rounded-full outline-none focus:border-ink-subtle placeholder:text-ink-muted"
        />
        <button
          type="submit"
          disabled={!draft.trim() || pending}
          aria-label="Enviar"
          className="shrink-0 h-8 w-8 rounded-full bg-ink text-paper flex items-center justify-center disabled:opacity-30 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <SendIcon />
        </button>
      </form>

      <Small
        variant="meta"
        className="px-3 py-1.5 border-t border-rule text-[10px] text-ink-muted"
      >
        Mockado · ainda sem ligação à API · {formatPrice(property.price, locale)}
      </Small>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isAgent = message.role === "agent";
  return (
    <div
      className={cn(
        "flex",
        isAgent ? "justify-start" : "justify-end",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-snug whitespace-pre-wrap break-words",
          isAgent
            ? "bg-paper-muted text-ink rounded-bl-md"
            : "bg-primary text-paper rounded-br-md",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

function buildGreeting(item: SearchResultItem, locale: string): string {
  const price = formatPrice(item.price, locale);
  if (item.propertyType === "land") {
    return (
      `Este terreno em ${item.title} está disponível por ${price}. ` +
      `É um excelente candidato para construir uma T3 — posso pôr-te em contacto ` +
      `com arquitetos e engenheiros parceiros, ou gerar uma simulação de como ` +
      `ficaria uma casa neste terreno. O que preferes?`
    );
  }
  if (item.propertyType === "ruin") {
    return (
      `Esta ruína em ${item.title} (${price}) é uma oportunidade de reabilitação. ` +
      `Posso ajudar-te a estimar o custo de obra ou ligar-te com empreiteiros da zona. ` +
      `Queres começar pela estimativa?`
    );
  }
  const bedroomLine =
    item.bedrooms > 0
      ? `Tem T${item.bedrooms}, `
      : "";
  const areaLine = item.areaSqm > 0 ? `${item.areaSqm} m², ` : "";
  return (
    `Olá! Esta propriedade em ${item.title} destaca-se: ` +
    `${bedroomLine}${areaLine}${price}. ` +
    `Costuma ter boas escolas por perto e bom acesso a transportes. ` +
    `Queres saber mais sobre a zona, financiamento ou agendar uma visita?`
  );
}

function buildMockReply(userText: string): string {
  const lower = userText.toLowerCase();
  if (/visita|agendar|ver|conhecer/.test(lower)) {
    return "Posso agendar uma visita. Que dia e hora preferes esta semana?";
  }
  if (/preço|valor|custa|barato|caro/.test(lower)) {
    return "O preço pode ser negociado conforme as condições. Tens algum orçamento-alvo em mente?";
  }
  if (/escola|filho|crianç|família/.test(lower)) {
    return "Existem várias escolas a poucos minutos a pé — públicas e privadas. Queres que envie a lista?";
  }
  if (/financiamento|crédito|empréstimo|mortgage/.test(lower)) {
    return "Trabalhamos com vários parceiros bancários. Posso fazer uma simulação rápida com o teu rendimento.";
  }
  return "Boa pergunta! Posso aprofundar esse ponto e voltar com mais detalhes assim que tiver o agente real ligado.";
}

function SparkleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4 h-4"
      aria-hidden
    >
      <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zM19 14l.9 2.7L22 17.5l-2.1.8L19 21l-.9-2.7L16 17.5l2.1-.8L19 14z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
