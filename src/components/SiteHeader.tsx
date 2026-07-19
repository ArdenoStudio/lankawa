"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const links = [
  { href: "/", key: "home" },
  { href: "/districts", key: "districts" },
  { href: "/disaster", key: "disaster" },
  { href: "/economy", key: "economy" },
] as const;

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-white">
          Lankawa
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  active
                    ? "bg-teal-500/20 text-teal-200"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {t(link.key)}
              </Link>
            );
          })}
          <a
            href="/api/v1/openapi.json"
            className="rounded-full px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
          >
            {t("api")}
          </a>
        </nav>
      </div>
    </header>
  );
}
