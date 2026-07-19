"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
  citations?: Array<{ label: string; path: string }>;
  mode?: "rule" | "llm";
}

export function CivicAssistant() {
  const t = useTranslations("assistant");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const question = input.trim();
    if (!question || loading) {
      return;
    }

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const response = await fetch("/api/v1/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = (await response.json()) as {
        answer?: string;
        citations?: Array<{ label: string; path: string }>;
        mode?: "rule" | "llm";
        error?: string;
      };

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer ?? data.error ?? t("errorFallback"),
          citations: data.citations,
          mode: data.mode,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t("errorFallback") },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-slate-400">{t("groundingNote")}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {(["usd", "colombo", "flood", "elections"] as const).map((key) => (
            <button
              key={key}
              type="button"
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-teal-300 hover:bg-white/5"
              onClick={() => setInput(t(`suggestions.${key}`))}
            >
              {t(`suggestions.${key}`)}
            </button>
          ))}
        </ul>
      </div>

      <div className="min-h-[280px] space-y-4 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">{t("emptyState")}</p>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`rounded-xl px-4 py-3 ${
                message.role === "user"
                  ? "ml-8 bg-teal-500/10 text-teal-100"
                  : "mr-8 bg-white/5 text-slate-200"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              {message.citations && message.citations.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.citations.map((citation) => (
                    <Link
                      key={citation.path}
                      href={citation.path}
                      className="text-xs text-teal-300 hover:text-teal-200"
                    >
                      {citation.label}
                    </Link>
                  ))}
                </div>
              ) : null}
              {message.mode ? (
                <p className="mt-1 text-xs text-slate-500">
                  {message.mode === "llm" ? t("modeLlm") : t("modeRule")}
                </p>
              ) : null}
            </div>
          ))
        )}
        {loading ? (
          <p className="text-sm text-slate-500">{t("thinking")}</p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t("inputPlaceholder")}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-teal-500/50 focus:outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-50"
        >
          {t("submit")}
        </button>
      </form>
    </div>
  );
}
