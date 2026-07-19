import { createHash, randomBytes } from "node:crypto";
import { isDatabaseConfigured } from "@/lib/db";

export interface BriefSubscriber {
  id: string;
  email: string;
  locale: string;
  confirmToken: string;
  confirmedAt: string | null;
  unsubscribedAt: string | null;
  lastSentAt: string | null;
}

function getDbConfig() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? null;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    null;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function createConfirmToken(): string {
  return randomBytes(24).toString("hex");
}

export function hashEmail(email: string): string {
  return createHash("sha256").update(normalizeEmail(email)).digest("hex");
}

export async function upsertBriefSubscriber(input: {
  email: string;
  locale: string;
}): Promise<{ ok: true; confirmToken: string } | { ok: false; error: string }> {
  const config = getDbConfig();
  if (!config || !isDatabaseConfigured()) {
    return {
      ok: false,
      error: "Brief subscriptions require Supabase configuration.",
    };
  }

  const email = normalizeEmail(input.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Invalid email address." };
  }

  const locale = ["en", "si", "ta"].includes(input.locale)
    ? input.locale
    : "en";
  const confirmToken = createConfirmToken();

  const response = await fetch(`${config.url}/rest/v1/brief_subscribers`, {
    method: "POST",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      email,
      locale,
      confirm_token: confirmToken,
      confirmed_at: null,
      unsubscribed_at: null,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    return { ok: false, error: text || `Subscribe failed (${response.status})` };
  }

  return { ok: true, confirmToken };
}

export async function confirmBriefSubscriber(
  token: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const config = getDbConfig();
  if (!config) {
    return { ok: false, error: "Database not configured." };
  }

  const response = await fetch(
    `${config.url}/rest/v1/brief_subscribers?confirm_token=eq.${encodeURIComponent(token)}`,
    {
      method: "PATCH",
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        confirmed_at: new Date().toISOString(),
      }),
    },
  );

  if (!response.ok) {
    return { ok: false, error: `Confirm failed (${response.status})` };
  }

  return { ok: true };
}

export async function listConfirmedSubscribers(
  limit = 200,
): Promise<BriefSubscriber[]> {
  const config = getDbConfig();
  if (!config) return [];

  const response = await fetch(
    `${config.url}/rest/v1/brief_subscribers?confirmed_at=not.is.null&unsubscribed_at=is.null&select=id,email,locale,confirm_token,confirmed_at,unsubscribed_at,last_sent_at&limit=${limit}`,
    {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) return [];

  const rows = (await response.json()) as Array<{
    id: string;
    email: string;
    locale: string;
    confirm_token: string;
    confirmed_at: string | null;
    unsubscribed_at: string | null;
    last_sent_at: string | null;
  }>;

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    locale: row.locale,
    confirmToken: row.confirm_token,
    confirmedAt: row.confirmed_at,
    unsubscribedAt: row.unsubscribed_at,
    lastSentAt: row.last_sent_at,
  }));
}

export async function markSubscriberSent(id: string): Promise<void> {
  const config = getDbConfig();
  if (!config) return;

  await fetch(
    `${config.url}/rest/v1/brief_subscribers?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ last_sent_at: new Date().toISOString() }),
    },
  );
}

export async function sendResendEmail(input: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.BRIEF_FROM_EMAIL?.trim();

  if (!apiKey || !from) {
    return { ok: false, error: "RESEND_API_KEY / BRIEF_FROM_EMAIL not set" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      text: input.text,
    }),
  });

  if (!response.ok) {
    return { ok: false, error: await response.text() };
  }

  return { ok: true };
}
