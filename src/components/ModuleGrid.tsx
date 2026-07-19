"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";

export interface ModuleItem {
  href: string;
  key: string;
  icon: ReactNode;
}

export interface ModuleSection {
  key: string;
  modules: readonly ModuleItem[];
}

const defaultModules = [
  {
    href: "/districts",
    key: "districts",
    icon: (
      <path
        d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: "/elections",
    key: "elections",
    icon: (
      <path
        d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: "/economy",
    key: "economy",
    icon: (
      <>
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </>
    ),
  },
  {
    href: "/property",
    key: "property",
    icon: (
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <path d="M9 22V12h6v10" />
      </>
    ),
  },
  {
    href: "/health",
    key: "health",
    icon: (
      <path
        d="M22 12h-4l-3 9L9 3l-3 9H2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: "/transport",
    key: "transport",
    icon: (
      <>
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h4l3 3v5h-2M16 16H6M6 16a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
      </>
    ),
  },
  {
    href: "/budget",
    key: "budget",
    icon: (
      <>
        <path d="M21 12V7H5a2 2 0 010-4h14v4" />
        <path d="M3 5v14a2 2 0 002 2h16v-5" />
        <path d="M18 12a2 2 0 100 4 2 2 0 000-4z" />
      </>
    ),
  },
  {
    href: "/compare",
    key: "compare",
    icon: (
      <>
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </>
    ),
  },
] as const satisfies readonly ModuleItem[];

function ModuleCard({ module }: { module: ModuleItem }) {
  const t = useTranslations("modules");

  return (
    <Link
      href={module.href}
          className={clsx("group flex gap-4 p-4", "lk-card-hover")}
        >
          <span className="lk-icon-ring h-10 w-10 shrink-0">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          aria-hidden="true"
        >
          {module.icon}
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-white">{t(`${module.key}.title`)}</span>
        <span className="mt-0.5 block text-sm leading-snug text-slate-400">
          {t(`${module.key}.description`)}
        </span>
      </span>
    </Link>
  );
}

function ModuleGridSection({ modules }: { modules: readonly ModuleItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((module) => (
        <ModuleCard key={module.href} module={module} />
      ))}
    </div>
  );
}

export function ModuleGrid({
  sections,
}: {
  sections?: readonly ModuleSection[];
}) {
  if (sections && sections.length > 0) {
    const t = useTranslations("explore");

    return (
      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.key} className="space-y-4">
            <h2 className="text-xl font-semibold text-white">{t(`sections.${section.key}`)}</h2>
            <ModuleGridSection modules={section.modules} />
          </section>
        ))}
      </div>
    );
  }

  return <ModuleGridSection modules={defaultModules} />;
}

export const exploreModuleCatalog = {
  districts: defaultModules[0],
  elections: defaultModules[1],
  economy: defaultModules[2],
  property: defaultModules[3],
  health: defaultModules[4],
  transport: defaultModules[5],
  budget: defaultModules[6],
  compare: defaultModules[7],
  provinces: {
    href: "/provinces",
    key: "provinces",
    icon: (
      <>
        <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z" />
        <path d="M12 22V10M3 6l9 4 9-4" />
      </>
    ),
  },
  localGovernment: {
    href: "/local-government",
    key: "localGovernment",
    icon: (
      <>
        <path d="M3 21h18M5 21V7l7-4 7 4v14" />
        <path d="M9 21v-6h6v6" />
      </>
    ),
  },
  civic: {
    href: "/civic",
    key: "civic",
    icon: (
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  tenders: {
    href: "/tenders",
    key: "tenders",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </>
    ),
  },
  costOfLiving: {
    href: "/cost-of-living",
    key: "costOfLiving",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
  },
  ardeno: {
    href: "/ardeno",
    key: "ardeno",
    icon: (
      <>
        <path d="M4 19h16M4 15l4-8 4 6 4-10 4 12" />
      </>
    ),
  },
  food: {
    href: "/food",
    key: "food",
    icon: (
      <>
        <path d="M18 8h1a4 4 0 010 8h-1" />
        <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
        <path d="M6 1v3M10 1v3M14 1v3" />
      </>
    ),
  },
  vehicles: {
    href: "/vehicles",
    key: "vehicles",
    icon: (
      <>
        <path d="M5 17h14v-5H5v5zM5 12l2-5h10l2 5" />
        <circle cx="7.5" cy="17" r="1.5" />
        <circle cx="16.5" cy="17" r="1.5" />
      </>
    ),
  },
  services: {
    href: "/services",
    key: "services",
    icon: (
      <>
        <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
      </>
    ),
  },
  environment: {
    href: "/environment",
    key: "environment",
    icon: (
      <>
        <path d="M12 22c5-3 8-7 8-11a8 8 0 10-16 0c0 4 3 8 8 11z" />
      </>
    ),
  },
  disaster: {
    href: "/disaster",
    key: "disaster",
    icon: (
      <>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </>
    ),
  },
  assistant: {
    href: "/assistant",
    key: "assistant",
    icon: (
      <>
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </>
    ),
  },
  status: {
    href: "/status",
    key: "status",
    icon: (
      <>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </>
    ),
  },
  sources: {
    href: "/sources",
    key: "sources",
    icon: (
      <>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
      </>
    ),
  },
  developers: {
    href: "/developers",
    key: "developers",
    icon: (
      <>
        <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
      </>
    ),
  },
} as const satisfies Record<string, ModuleItem>;

export const exploreSections: readonly ModuleSection[] = [
  {
    key: "civicGeography",
    modules: [
      exploreModuleCatalog.districts,
      exploreModuleCatalog.provinces,
      exploreModuleCatalog.compare,
      exploreModuleCatalog.localGovernment,
    ],
  },
  {
    key: "electionsGovernance",
    modules: [
      exploreModuleCatalog.elections,
      exploreModuleCatalog.budget,
      exploreModuleCatalog.civic,
      exploreModuleCatalog.tenders,
    ],
  },
  {
    key: "economyLiving",
    modules: [
      exploreModuleCatalog.economy,
      exploreModuleCatalog.property,
      exploreModuleCatalog.costOfLiving,
      exploreModuleCatalog.ardeno,
      exploreModuleCatalog.food,
      exploreModuleCatalog.vehicles,
    ],
  },
  {
    key: "servicesTransport",
    modules: [
      exploreModuleCatalog.services,
      exploreModuleCatalog.transport,
      exploreModuleCatalog.health,
      exploreModuleCatalog.environment,
      exploreModuleCatalog.disaster,
    ],
  },
  {
    key: "platform",
    modules: [
      exploreModuleCatalog.assistant,
      exploreModuleCatalog.status,
      exploreModuleCatalog.sources,
      exploreModuleCatalog.developers,
    ],
  },
];
