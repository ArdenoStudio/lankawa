import { getTranslations } from "next-intl/server";
import type { FoodProvenance } from "@/lib/integrations/food";

/** P30 — HARTI / essentials honesty when FoodLK live path is down. */
export async function HartiEssentialsNote({
  provenance,
}: {
  provenance: FoodProvenance;
}) {
  if (provenance === "live") {
    return null;
  }

  const t = await getTranslations("food");

  return (
    <aside className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
      <p className="font-medium text-white">{t("hartiTitle")}</p>
      <p className="mt-1 text-slate-300">
        {provenance === "life_federation"
          ? t("hartiBodyLife")
          : t("hartiBodySeed")}
      </p>
      <p className="mt-2 text-xs text-slate-500">{t("hartiHonesty")}</p>
    </aside>
  );
}
