import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/ui/PageHeader";

// Pre-launch F15. Legal content is published in English (the working language
// of Sri Lanka's Personal Data Protection Act, No. 9 of 2022) across all
// locales; the page chrome (header/footer) remains localised.
export default async function PrivacyPage({
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
        title="Privacy Policy"
        subtitle="Last updated: 9 October 2026"
      />

      <section className="lk-card relative overflow-hidden p-6 md:p-8">
        <div className="relative space-y-4">
          <p className="max-w-2xl text-neutral-400">
            Lankawa is a read-mostly civic intelligence platform. We collect
            the minimum data needed to run the service, we never sell personal
            data, and there are no accounts, no tracking cookies, and no
            advertising profiles.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">
          Information we collect
        </h2>
        <ul className="list-inside list-disc space-y-2 text-sm text-slate-400">
          <li>
            <span className="text-slate-200">Morning-brief email address</span>{" "}
            — only if you subscribe. Used solely to send the brief you asked
            for. Subscription is double opt-in: we email a confirmation link
            before anything is sent.
          </li>
          <li>
            <span className="text-slate-200">On-device usage counters</span> —
            a small set of anonymous counters (e.g. home views, returning
            visits) stored in your browser&rsquo;s localStorage. They never
            leave your device.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">
          What we don&rsquo;t collect
        </h2>
        <ul className="list-inside list-disc space-y-2 text-sm text-slate-400">
          <li>No user accounts, names, or passwords.</li>
          <li>No third-party analytics, advertising, or cross-site trackers.</li>
          <li>No location data beyond what you choose to view.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">
          How your email is used
        </h2>
        <p className="max-w-2xl text-sm text-slate-400">
          Subscriber addresses are stored securely and used only for the
          morning civic brief. Every email carries a one-click unsubscribe
          link; unsubscribing deletes the address from the mailing list. We do
          not share or sell subscriber addresses to anyone.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">
          Your rights under Sri Lanka&rsquo;s PDPA
        </h2>
        <p className="max-w-2xl text-sm text-slate-400">
          Under the Personal Data Protection Act, No. 9 of 2022, you have the
          right to know what personal data we hold about you, to request
          correction, and to withdraw consent at any time. To exercise these
          rights — for example, to confirm whether an address is subscribed or
          to request deletion — open an issue on our GitHub repository (see
          the Contact page) and we will respond.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">
          Data retention &amp; security
        </h2>
        <p className="max-w-2xl text-sm text-slate-400">
          Email addresses are kept only while a subscription is active and are
          removed on unsubscribe. Subscriber data is accessed server-side only
          over encrypted connections; there is no browser or client-side path
          to the subscriber database.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">
          Third-party processors
        </h2>
        <p className="max-w-2xl text-sm text-slate-400">
          When the morning brief is enabled, emails are delivered via Resend
          and subscriber records are stored in Supabase Postgres. No other
          personal data leaves our infrastructure.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">
          Changes to this policy
        </h2>
        <p className="max-w-2xl text-sm text-slate-400">
          If this policy changes materially, the updated version will be
          published here with a new revision date.
        </p>
      </section>
    </div>
  );
}
