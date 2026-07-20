import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * P62 — partner signed change webhooks.
 * Sign the raw JSON body with HMAC-SHA256; send as `X-Lankawa-Signature: sha256=<hex>`.
 */
export function signWebhookBody(body: string, secret: string): string {
  const digest = createHmac("sha256", secret).update(body, "utf8").digest("hex");
  return `sha256=${digest}`;
}

export function verifyWebhookSignature(
  body: string,
  secret: string,
  signatureHeader: string | null | undefined,
): boolean {
  if (!signatureHeader || !secret) {
    return false;
  }
  const expected = signWebhookBody(body, secret);
  const provided = signatureHeader.trim();
  if (expected.length !== provided.length) {
    return false;
  }
  try {
    return timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(provided, "utf8"),
    );
  } catch {
    return false;
  }
}
