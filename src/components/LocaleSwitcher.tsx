"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

const localeLabels: Record<AppLocale, string> = {
  en: "EN",
  si: "සි",
  ta: "த",
};

export function LocaleSwitcher() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className="flex items-center rounded-full border border-white/10 bg-white/5 p-0.5"
      role="group"
      aria-label="Language"
    >
      {routing.locales.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => router.replace(pathname, { locale: code })}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
              active
                ? "bg-teal-500 text-slate-950"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            aria-current={active ? "true" : undefined}
          >
            {localeLabels[code]}
          </button>
        );
      })}
    </div>
  );
}
