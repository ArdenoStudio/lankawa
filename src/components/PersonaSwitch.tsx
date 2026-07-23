"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  isViewPersona,
  orderModulesForPersona,
  readViewPersona,
  VIEW_PERSONA_EVENT,
  VIEW_PERSONAS,
  writeViewPersona,
  type ViewPersona,
} from "@/lib/view-persona";
import {
  ModuleGrid,
  type ModuleSection,
} from "@/components/ModuleGrid";

const PERSONA_SECTION_ORDER: Record<ViewPersona, readonly string[]> = {
  citizen: [
    "civicGeography",
    "servicesTransport",
    "economyLiving",
    "electionsGovernance",
    "platform",
  ],
  markets: [
    "economyLiving",
    "electionsGovernance",
    "civicGeography",
    "servicesTransport",
    "platform",
  ],
  ops: [
    "servicesTransport",
    "platform",
    "civicGeography",
    "electionsGovernance",
    "economyLiving",
  ],
};

function orderSectionsForPersona(
  sections: readonly ModuleSection[],
  persona: ViewPersona,
): ModuleSection[] {
  const rank = new Map(
    PERSONA_SECTION_ORDER[persona].map((key, index) => [key, index]),
  );
  return [...sections]
    .map((section) => ({
      ...section,
      modules: orderModulesForPersona(section.modules, persona),
    }))
    .sort((a, b) => {
      const aRank = rank.get(a.key);
      const bRank = rank.get(b.key);
      if (aRank == null && bRank == null) return 0;
      if (aRank == null) return 1;
      if (bRank == null) return -1;
      return aRank - bRank;
    });
}

function initialPersonaState(initialPersona?: ViewPersona): ViewPersona {
  if (initialPersona) {
    return initialPersona;
  }
  if (typeof window === "undefined") {
    return "citizen";
  }
  return readViewPersona(window.localStorage);
}

export function PersonaSwitch({
  initialPersona,
}: {
  initialPersona?: ViewPersona;
}) {
  const t = useTranslations("persona");
  const router = useRouter();
  const pathname = usePathname();
  const [persona, setPersona] = useState<ViewPersona>(() =>
    initialPersonaState(initialPersona),
  );

  useEffect(() => {
    if (initialPersona) {
      writeViewPersona(window.localStorage, initialPersona);
    }

    function onPersona(event: Event) {
      const detail = (event as CustomEvent<ViewPersona>).detail;
      if (isViewPersona(detail)) {
        setPersona(detail);
      }
    }

    window.addEventListener(VIEW_PERSONA_EVENT, onPersona);
    return () => window.removeEventListener(VIEW_PERSONA_EVENT, onPersona);
  }, [initialPersona]);

  function select(next: ViewPersona) {
    setPersona(next);
    writeViewPersona(window.localStorage, next);
    router.replace(`${pathname}?view=${next}`);
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label={t("label")}
    >
      <span className="text-xs uppercase tracking-[0.14em] text-slate-500">
        {t("label")}
      </span>
      <div className="flex flex-wrap gap-1">
        {VIEW_PERSONAS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => select(option)}
            className={clsx(
              "rounded-lg border px-2.5 py-1 text-xs font-medium transition",
              persona === option
                ? "border-teal-400/40 bg-teal-500/15 text-teal-100"
                : "border-white/15 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-white",
            )}
            aria-pressed={persona === option}
          >
            {t(option)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ExplorePersonaModules({
  sections,
  initialPersona,
}: {
  sections: readonly ModuleSection[];
  initialPersona?: ViewPersona;
}) {
  const [persona, setPersona] = useState<ViewPersona>(() =>
    initialPersonaState(initialPersona),
  );

  useEffect(() => {
    function onPersona(event: Event) {
      const detail = (event as CustomEvent<ViewPersona>).detail;
      if (isViewPersona(detail)) {
        setPersona(detail);
      }
    }

    window.addEventListener(VIEW_PERSONA_EVENT, onPersona);
    return () => window.removeEventListener(VIEW_PERSONA_EVENT, onPersona);
  }, []);

  const ordered = orderSectionsForPersona(sections, persona);

  return (
    <div className="space-y-4">
      <PersonaSwitch initialPersona={initialPersona} />
      <ModuleGrid sections={ordered} />
    </div>
  );
}
