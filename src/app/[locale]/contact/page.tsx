import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/ui/PageHeader";

// Pre-launch F19. Lankawa has no published maintainer email yet (see
// NEEDS-YOU in the launch notes), so the primary contact channel is the
// public GitHub issue tracker.
const GITHUB_ISSUES_URL = "https://github.com/ArdenoStudio/lankawa/issues";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Get in touch"
        title="Contact"
        subtitle="Questions, corrections, or data issues — here's how to reach the team behind Lankawa."
      />

      <section className="lk-card relative overflow-hidden p-6 md:p-8">
        <div className="relative space-y-4">
          <h2 className="font-display text-xl font-semibold text-white">
            GitHub issues
          </h2>
          <p className="max-w-2xl text-sm text-neutral-400">
            The fastest way to reach us is the public issue tracker. It works
            for bug reports, data corrections, source suggestions, and general
            questions — and keeps the conversation visible for everyone.
          </p>
          <a
            href={GITHUB_ISSUES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="lk-btn-primary inline-block"
          >
            Open an issue on GitHub
          </a>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">
          Reporting a data problem
        </h2>
        <p className="max-w-2xl text-sm text-slate-400">
          If a number looks wrong, include the page URL, the figure you saw,
          and the observed timestamp shown next to it. Every Lankawa number
          carries its source and timestamp precisely so issues like this can
          be traced.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Email</h2>
        <p className="max-w-2xl text-sm text-slate-400">
          A dedicated contact email address is not published yet — please use
          GitHub issues in the meantime.
        </p>
      </section>
    </div>
  );
}
