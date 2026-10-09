import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/PageHeader";

// Pre-launch F15. Terms published in English across all locales; the page
// chrome (header/footer) remains localised.
export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Legal"
        title="Terms of Use"
        subtitle="Last updated: 9 October 2026"
      />

      <section className="lk-card relative overflow-hidden p-6 md:p-8">
        <div className="relative space-y-4">
          <p className="max-w-2xl text-neutral-400">
            By using Lankawa you agree to these terms. If you don&rsquo;t
            agree, please don&rsquo;t use the service.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">The service</h2>
        <p className="max-w-2xl text-sm text-slate-400">
          Lankawa aggregates publicly available data about Sri Lanka —
          economic indicators, district statistics, disaster information, and
          public services — and presents it with source provenance and
          freshness information on every number. The service is free to use.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">
          Data accuracy disclaimer
        </h2>
        <p className="max-w-2xl text-sm text-slate-400">
          Lankawa is <span className="text-slate-200">not</span> an official
          government publication. Data is aggregated from public sources and
          shown with its provenance and observed timestamp; sources can be
          delayed, revised, or temporarily unavailable, and seed fallback
          values are clearly labelled when live sources are down. Do not rely
          on Lankawa as the sole basis for financial, legal, medical, or
          safety-critical decisions — always verify against the original
          source.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">
          Acceptable use of the public API
        </h2>
        <ul className="list-inside list-disc space-y-2 text-sm text-slate-400">
          <li>
            Respect the published rate limits (see{" "}
            <Link
              href="/developers"
              className="text-[var(--lk-teal-bright)] hover:text-teal-200"
            >
              Developers
            </Link>
            ). Automated clients must identify themselves with a descriptive
            User-Agent.
          </li>
          <li>
            Do not attempt to disrupt the service, circumvent rate limits, or
            misrepresent Lankawa data as official government statistics.
          </li>
          <li>
            You may quote and republish Lankawa figures with attribution and a
            link back to the relevant page.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">
          No accounts, no warranties
        </h2>
        <p className="max-w-2xl text-sm text-slate-400">
          The service is provided &ldquo;as is&rdquo;, without warranties of
          any kind. We aim for high availability but do not guarantee
          uninterrupted access. We may change or discontinue parts of the
          service at any time.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Privacy</h2>
        <p className="max-w-2xl text-sm text-slate-400">
          How we handle personal data is described in our{" "}
          <Link
            href="/privacy"
            className="text-[var(--lk-teal-bright)] hover:text-teal-200"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Changes to terms</h2>
        <p className="max-w-2xl text-sm text-slate-400">
          Material changes to these terms will be published here with a new
          revision date. Continued use of the service after changes take
          effect constitutes acceptance.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Contact</h2>
        <p className="max-w-2xl text-sm text-slate-400">
          Questions about these terms? Reach us via the{" "}
          <Link
            href="/contact"
            className="text-[var(--lk-teal-bright)] hover:text-teal-200"
          >
            Contact page
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
