"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  propertyId: string;
  dict: Record<string, string>;
}

export function PropertyChatbot({ propertyId, dict }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: dict.chatWelcome },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.filter((m) => m.role === "user"),
          propertyId,
        }),
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        assistantContent += decoder.decode(value, { stream: true });
        const content = assistantContent;
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="border border-gray-200 bg-white p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <svg
          className="size-4 text-gray-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <h3 className="text-xs text-gray-400 uppercase">{dict.chatTitle}</h3>
      </div>

      {/* Messages */}
      <div className="max-h-64 overflow-y-auto space-y-2 mb-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm p-2 ${
              msg.role === "user"
                ? "bg-blue-50 text-blue-900 ml-4"
                : "bg-gray-50 text-gray-700 mr-4"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="bg-gray-50 text-gray-400 text-sm p-2 mr-4">…</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={dict.chatPlaceholder}
          className="flex-1 text-sm border border-gray-200 px-3 py-1.5 focus:outline-none focus:border-gray-400"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="text-sm px-3 py-1.5 bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {dict.chatSend}
        </button>
      </div>
    </div>
  );
}
