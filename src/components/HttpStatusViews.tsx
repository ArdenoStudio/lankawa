// Shared monochrome 404 view (pre-launch F11). Used by both
// app/not-found.tsx (notFound() calls, e.g. invalid locale) and
// app/global-not-found.tsx (unmatched routes). Inline styles only —
// global-not-found bypasses the app's normal rendering pipeline.
export function NotFoundView() {
  return (
    <main
      style={{
        textAlign: "center",
        padding: "2rem",
        maxWidth: "32rem",
        margin: "0 auto",
      }}
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
          fontSize: "4.5rem",
          fontWeight: 700,
          margin: "0 0 0.75rem",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        404
      </h1>
      <p
        style={{
          color: "#a3a3a3",
          margin: "0 0 2rem",
          lineHeight: 1.6,
          fontSize: "1rem",
        }}
      >
        This page doesn&rsquo;t exist — or the data behind it hasn&rsquo;t been
        published yet.
      </p>
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
        Back to the homepage
      </a>
    </main>
  );
}

export function ErrorDocumentShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#050505",
          color: "#fafafa",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </body>
    </html>
  );
}
