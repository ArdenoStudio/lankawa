"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export interface CitationCardProps {
  title: string;
  value: string | number;
  unit?: string;
  observedAt: string;
  sourceName: string;
  sourcePath: string;
  permalink?: string;
  className?: string;
}

function formatObservedDate(value: string, locale: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

function buildCitationUrl(sourcePath: string, permalink?: string): string {
  const target = permalink ?? window.location.href;

  try {
    return new URL(target, window.location.origin).toString();
  } catch {
    return permalink ?? sourcePath;
  }
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand("copy");
  } finally {
    textarea.remove();
  }
}

export function CitationCard({
  title,
  value,
  unit,
  observedAt,
  sourceName,
  sourcePath,
  permalink,
  className,
}: CitationCardProps) {
  const locale = useLocale();
  const t = useTranslations("citation");
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const observedDate = useMemo(
    () => formatObservedDate(observedAt, locale),
    [locale, observedAt],
  );
  const valueWithUnit = [String(value), unit].filter(Boolean).join(" ");

  async function handleCopy() {
    setStatus("idle");

    try {
      const citationUrl = buildCitationUrl(sourcePath, permalink);
      await copyText(
        `${title}: ${valueWithUnit} (as of ${observedDate}). Source: ${sourceName}. Via Lankawa ${citationUrl}. Not an official government publication.`,
      );
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  return (
    <aside
      className={[
        "rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-400",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium uppercase tracking-wide text-slate-500">
            {t("label")}
          </p>
          <p className="mt-1 text-sm font-semibold text-white">{title}</p>
          <p className="mt-1">
            {valueWithUnit} · {t("asOf", { date: observedDate })}
          </p>
          <p className="mt-1">
            {t("source")}{" "}
            <Link
              href={sourcePath}
              className="text-slate-200 underline decoration-white/20 underline-offset-4 hover:text-white"
            >
              {sourceName}
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-white/20 bg-white px-3 py-1.5 text-xs font-medium text-black transition hover:bg-slate-200"
        >
          {t("copy")}
        </button>
      </div>
      <p className="mt-2 text-slate-500">{t("disclaimer")}</p>
      <p className="mt-2 text-slate-500" aria-live="polite">
        {status === "copied"
          ? t("copied")
          : status === "error"
            ? t("error")
            : null}
      </p>
    </aside>
  );
}
