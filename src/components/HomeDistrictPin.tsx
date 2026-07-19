"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DISTRICTS, getDistrict, getDistrictName } from "@/lib/districts";
import { readHomeDistrict, writeHomeDistrict } from "@/lib/preferences";

export function HomeDistrictPin({ locale }: { locale: string }) {
  const t = useTranslations("homeDistrict");
  const [slug, setSlug] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSlug(readHomeDistrict(window.localStorage));
    setReady(true);
  }, []);

  function handleChange(next: string) {
    const value = next || null;
    writeHomeDistrict(window.localStorage, value);
    setSlug(value);
  }

  if (!ready) {
    return null;
  }

  const district = slug ? getDistrict(slug) : undefined;

  return (
    <section className="rounded-2xl border border-white/15 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-neutral-400">{t("subtitle")}</p>
        </div>
        <label className="block text-sm text-neutral-300">
          <span className="sr-only">{t("selectLabel")}</span>
          <select
            value={slug ?? ""}
            onChange={(event) => handleChange(event.target.value)}
            className="rounded-full border border-white/20 bg-black px-3 py-1.5 text-sm text-white"
          >
            <option value="">{t("none")}</option>
            {DISTRICTS.map((item) => (
              <option key={item.slug} value={item.slug}>
                {getDistrictName(item, locale)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {district ? (
        <p className="mt-3 text-sm text-neutral-300">
          {t("pinned", { district: getDistrictName(district, locale) })}{" "}
          <Link
            href={`/districts/${district.slug}`}
            className="text-white underline decoration-white/40 hover:decoration-white"
          >
            {t("openDistrict")}
          </Link>
        </p>
      ) : null}
    </section>
  );
}
