"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { GlobalSearch } from "@/components/GlobalSearch";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Logo } from "@/components/brand/Logo";
import { useDataSaver } from "@/components/DataSaverProvider";

const primaryLinks = [
  { href: "/districts", key: "districts" },
  { href: "/explore", key: "explore" },
] as const;

const moreLinks = [
  { href: "/elections", key: "elections" },
  { href: "/economy", key: "economy" },
  { href: "/services", key: "services" },
  { href: "/provinces", key: "provinces" },
  { href: "/disaster", key: "disaster" },
  { href: "/budget", key: "budget" },
  { href: "/property", key: "property" },
  { href: "/vehicles", key: "vehicles" },
  { href: "/food", key: "food" },
  { href: "/transport", key: "transport" },
  { href: "/cost-of-living", key: "costOfLiving" },
  { href: "/ardeno", key: "ardeno" },
  { href: "/health", key: "health" },
  { href: "/environment", key: "environment" },
  { href: "/compare", key: "compare" },
  { href: "/civic", key: "civic" },
  { href: "/tenders", key: "tenders" },
  { href: "/assistant", key: "assistant" },
  { href: "/status", key: "status" },
  { href: "/learn", key: "learn" },
  { href: "/sources", key: "sources" },
  { href: "/developers", key: "developers" },
] as const;

const mobileSections = [
  {
    key: "explore",
    links: [
      { href: "/explore", key: "explore" },
      { href: "/districts", key: "districts" },
      { href: "/provinces", key: "provinces" },
      { href: "/compare", key: "compare" },
    ],
  },
  {
    key: "governance",
    links: [
      { href: "/elections", key: "elections" },
      { href: "/budget", key: "budget" },
      { href: "/civic", key: "civic" },
      { href: "/tenders", key: "tenders" },
    ],
  },
  {
    key: "data",
    links: [
      { href: "/economy", key: "economy" },
      { href: "/budget", key: "budget" },
      { href: "/property", key: "property" },
      { href: "/health", key: "health" },
      { href: "/transport", key: "transport" },
      { href: "/environment", key: "environment" },
    ],
  },
  {
    key: "civic",
    links: [
      { href: "/services", key: "services" },
      { href: "/disaster", key: "disaster" },
      { href: "/ardeno", key: "ardeno" },
      { href: "/assistant", key: "assistant" },
    ],
  },
  {
    key: "more",
    links: [
      { href: "/status", key: "status" },
      { href: "/learn", key: "learn" },
      { href: "/sources", key: "sources" },
      { href: "/developers", key: "developers" },
      { href: "/about", key: "about" },
    ],
  },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}

function NavLink({
  href,
  label,
  active,
  onNavigate,
  className,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`rounded-full px-3 py-1.5 text-sm transition ${
        active
          ? "bg-white text-black"
          : "text-neutral-300 hover:bg-white/5 hover:text-white"
      } ${className ?? ""}`}
    >
      {label}
    </Link>
  );
}

function MoreDropdown({ pathname }: { pathname: string }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const moreActive = moreLinks.some((link) => isActive(pathname, link.href));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition ${
          moreActive || open
            ? "bg-white/15 text-white"
            : "text-neutral-300 hover:bg-white/5 hover:text-white"
        }`}
      >
        {t("more")}
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-white/12 bg-black/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur-md">
          {moreLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block rounded-xl px-3 py-2 text-sm transition ${
                isActive(pathname, link.href)
                  ? "bg-white text-black"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {t(link.key)}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { enabled: dataSaverEnabled, hydrated, toggle: toggleDataSaver } =
    useDataSaver();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={clsx(
        "sticky top-0 z-40 border-b bg-black/80 backdrop-blur-md transition-shadow duration-300",
        scrolled
          ? "border-white/15 shadow-[0_8px_28px_rgba(0,0,0,0.45)]"
          : "border-white/10",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Logo variant="wordmark" />

        <nav className="hidden items-center gap-1 lg:flex lg:flex-1 lg:justify-center">
          {primaryLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={t(link.key)}
              active={isActive(pathname, link.href)}
            />
          ))}
          <MoreDropdown pathname={pathname} />
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <div className="hidden w-44 xl:block xl:w-52">
            <GlobalSearch />
          </div>
          <LocaleSwitcher />
          <button
            type="button"
            onClick={toggleDataSaver}
            aria-pressed={hydrated ? dataSaverEnabled : false}
            aria-label={t("dataSaverToggle")}
            className={`hidden rounded-full border px-3 py-1.5 text-xs font-medium transition sm:inline-flex ${
              hydrated && dataSaverEnabled
                ? "border-white bg-white text-black"
                : "border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            {t("dataSaver")}{" "}
            <span className="ml-1 text-[10px] uppercase tracking-wide">
              {hydrated && dataSaverEnabled
                ? t("dataSaverOn")
                : t("dataSaverOff")}
            </span>
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-white/10 p-2 text-slate-200 hover:bg-white/5 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              ) : (
                <>
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      <div className="border-t border-white/5 px-4 pb-3 lg:hidden">
        <GlobalSearch />
      </div>

      {menuOpen ? (
        <nav
          id="mobile-nav"
          className="border-t border-white/10 px-4 py-4 lg:hidden"
        >
          <div className="mb-4 sm:hidden">
            <button
              type="button"
              onClick={toggleDataSaver}
              aria-pressed={hydrated ? dataSaverEnabled : false}
              className={`w-full rounded-full border px-3 py-2 text-sm font-medium transition ${
                hydrated && dataSaverEnabled
                  ? "border-white bg-white text-black"
                  : "border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {t("dataSaver")} ·{" "}
              {hydrated && dataSaverEnabled
                ? t("dataSaverOn")
                : t("dataSaverOff")}
            </button>
          </div>
          <div className="space-y-5">
            {mobileSections.map((section) => (
              <div key={section.key}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t(section.key)}
                </p>
                <div className="flex flex-col gap-1">
                  {section.links.map((link) => (
                    <NavLink
                      key={link.href}
                      href={link.href}
                      label={t(link.key)}
                      active={isActive(pathname, link.href)}
                      onNavigate={() => setMenuOpen(false)}
                      className="block w-full text-left"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
