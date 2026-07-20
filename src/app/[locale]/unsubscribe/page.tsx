"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { FormEvent, Suspense, useState } from "react";
import { Link } from "@/i18n/navigation";

function UnsubscribeForm() {
  const t = useTranslations("briefSubscribe.unsubscribe");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get("token")?.trim() ?? "";
  const initialEmail = searchParams.get("email")?.trim() ?? "";
  const doneFromQuery = searchParams.get("done") === "1";

  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    doneFromQuery ? "ok" : "idle",
  );
  const [message, setMessage] = useState<string | null>(() =>
    doneFromQuery ? t("success") : null,
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/v1/subscribe/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email: email || undefined,
          locale,
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        setStatus("error");
        setMessage(payload.error ?? t("error"));
        return;
      }

      setStatus("ok");
      setMessage(t("success"));
    } catch {
      setStatus("error");
      setMessage(t("error"));
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Lankawa
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-white">
          {t("title")}
        </h1>
        <p className="mt-2 text-slate-400">{t("subtitle")}</p>
      </div>

      {status === "ok" ? (
        <div className="space-y-4 rounded-2xl border border-white/15 bg-white/[0.03] p-5">
          <p className="text-sm text-neutral-200" role="status">
            {message}
          </p>
          <Link
            href="/"
            className="inline-block text-sm text-teal-300 hover:text-teal-200"
          >
            {t("homeLink")}
          </Link>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-white/15 bg-white/[0.03] p-5"
        >
          <div>
            <label
              htmlFor="unsubscribe-email"
              className="block text-xs text-neutral-400"
            >
              {t("emailLabel")}
            </label>
            <input
              id="unsubscribe-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("emailPlaceholder")}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/40"
            />
          </div>
          <div>
            <label
              htmlFor="unsubscribe-token"
              className="block text-xs text-neutral-400"
            >
              {t("tokenLabel")}
            </label>
            <input
              id="unsubscribe-token"
              type="text"
              required
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder={t("tokenPlaceholder")}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/40"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading" || !token.trim()}
            className="rounded-lg border border-white bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
          >
            {status === "loading" ? t("submitting") : t("submit")}
          </button>
          {message ? (
            <p className="text-xs text-neutral-300" role="status">
              {message}
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg text-sm text-slate-400">…</div>
      }
    >
      <UnsubscribeForm />
    </Suspense>
  );
}
