"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "lankawa_week_ledger";

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

const DAYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

function weekId(date = new Date()): string {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function todayKey(date = new Date()): DayKey {
  const map: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[date.getDay()];
}

function readLedger(storage: Storage): Record<string, DayKey[]> {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, DayKey[]>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function WeekLedger() {
  const t = useTranslations("weekLedger");
  const id = useMemo(() => weekId(), []);
  const today = useMemo(() => todayKey(), []);
  const [checked, setChecked] = useState<DayKey[]>(() => {
    if (typeof window === "undefined") return [];
    return readLedger(window.localStorage)[id] ?? [];
  });

  function toggle(day: DayKey) {
    const next = checked.includes(day)
      ? checked.filter((item) => item !== day)
      : [...checked, day];
    const all = readLedger(window.localStorage);
    all[id] = next;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    setChecked(next);
  }

  return (
    <section className="rounded-2xl border border-white/15 bg-white/[0.03] p-4">
      <div>
        <h2 className="font-display text-lg font-semibold text-white">
          {t("title")}
        </h2>
        <p className="mt-1 text-sm text-neutral-400">{t("subtitle")}</p>
      </div>
      <ul className="mt-4 grid grid-cols-7 gap-1.5">
        {DAYS.map((day) => {
          const on = checked.includes(day);
          const isToday = day === today;
          return (
            <li key={day}>
              <button
                type="button"
                onClick={() => toggle(day)}
                aria-pressed={on}
                className={[
                  "flex h-14 w-full flex-col items-center justify-center rounded-xl border text-xs transition",
                  on
                    ? "border-white bg-white text-black"
                    : "border-white/15 bg-black/30 text-neutral-300 hover:border-white/35",
                  isToday ? "ring-1 ring-white/40" : "",
                ].join(" ")}
              >
                <span className="font-medium uppercase">{t(`day_${day}`)}</span>
                <span className="mt-1 tabular-nums opacity-70">
                  {on ? t("done") : t("mark")}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-neutral-500">
        {t("count", { count: checked.length })} · {t("privacy")}
      </p>
    </section>
  );
}
