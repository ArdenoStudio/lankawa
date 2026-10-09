import type { Metadata } from "next";
import { ErrorDocumentShell, NotFoundView } from "@/components/HttpStatusViews";

export const metadata: Metadata = {
  title: "404 — Page not found · Lankawa",
  description: "The page you are looking for does not exist.",
};

// Segment-level 404: rendered when notFound() is thrown inside a route
// (e.g. an invalid locale in [locale]/layout.tsx). Unmatched URLs are
// handled by app/global-not-found.tsx.
export default function NotFound() {
  return (
    <ErrorDocumentShell>
      <NotFoundView />
    </ErrorDocumentShell>
  );
}
