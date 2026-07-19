"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export function BriefSubscribeForm() {
  const t = useTranslations("briefSubscribe");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/v1/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        setStatus("error");
        setMessage(payload.error ?? t("error"));
        return;
      }

      setStatus("ok");
      setMessage(payload.message ?? t("ok"));
      setEmail("");
    } catch {
      setStatus("error");
      setMessage(t("error"));
    }
  }

  return (
    <section className="rounded-2xl border border-white/15 bg-white/[0.03] p-4">
      <h2 className="font-display text-lg font-semibold text-white">
        {t("title")}
      </h2>
      <p className="mt-1 text-sm text-neutral-400">{t("subtitle")}</p>
      <form onSubmit={onSubmit} className="mt-4 flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="brief-email">
          {t("emailLabel")}
        </label>
        <input
          id="brief-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("emailPlaceholder")}
          className="min-w-[16rem] flex-1 rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/40"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg border border-white bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
        >
          {status === "loading" ? t("submitting") : t("submit")}
        </button>
      </form>
      {message ? (
        <p
          className={`mt-3 text-xs ${status === "error" ? "text-neutral-300" : "text-neutral-400"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
      <p className="mt-3 text-xs text-neutral-500">{t("privacy")}</p>
    </section>
  );
}
