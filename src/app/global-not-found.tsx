import type { Metadata } from "next";
import { ErrorDocumentShell, NotFoundView } from "@/components/HttpStatusViews";

export const metadata: Metadata = {
  title: "404 — Page not found · Lankawa",
  description: "The page you are looking for does not exist.",
};

// Global 404 for unmatched routes (Next 16: enabled via
// experimental.globalNotFound in next.config.ts). Handled at the routing
// level — bypasses layouts, so it ships its own document shell.
export default function GlobalNotFound() {
  return (
    <ErrorDocumentShell>
      <NotFoundView />
    </ErrorDocumentShell>
  );
}
