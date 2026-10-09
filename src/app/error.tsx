"use client";

// Segment error boundary (pre-launch F11). Next 16 passes `unstable_retry`
// (not `reset`). Reports to Sentry when a DSN is configured. Strict
// monochrome, inline styles — no globals.css dependency.
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorDocumentShell } from "@/components/HttpStatusViews";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <ErrorDocumentShell>
      <main
        style={{ textAlign: "center", padding: "2rem", maxWidth: "32rem" }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.35em",
            color: "#737373",
            margin: "0 0 1.25rem",
          }}
        >
          LANKAWA
        </p>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            margin: "0 0 0.75rem",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            color: "#a3a3a3",
            margin: "0 0 2rem",
            lineHeight: 1.6,
            fontSize: "1rem",
          }}
        >
          We couldn&rsquo;t load this page. The error has been logged and
          we&rsquo;ll look into it.
        </p>
        <div
          style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}
        >
          <button
            onClick={() => unstable_retry()}
            style={{
              border: "1px solid #fafafa",
              background: "#fafafa",
              color: "#050505",
              borderRadius: "0.5rem",
              padding: "0.75rem 1.75rem",
              fontSize: "0.875rem",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Try again
          </button>
          <a
            href="/en"
            style={{
              display: "inline-block",
              border: "1px solid #404040",
              borderRadius: "0.5rem",
              padding: "0.75rem 1.75rem",
              color: "#fafafa",
              textDecoration: "none",
              fontSize: "0.875rem",
            }}
          >
            Homepage
          </a>
        </div>
      </main>
    </ErrorDocumentShell>
  );
}
