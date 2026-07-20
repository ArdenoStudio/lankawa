/**
 * Ops-only Telegram alerts (P65). Never used in consumer UI.
 * Gated by TELEGRAM_OPS_BOT_TOKEN + TELEGRAM_OPS_CHAT_ID.
 */

const FAILURE_STREAK_THRESHOLD = 3;

export interface OpsTelegramResult {
  sent: boolean;
  skippedReason?: string;
  status?: number;
}

export function shouldAlertFailureStreak(
  consecutiveFailures: number,
  threshold = FAILURE_STREAK_THRESHOLD,
): boolean {
  return consecutiveFailures > threshold;
}

export function formatAdapterFailureAlert(input: {
  sourceId: string;
  consecutiveFailures: number;
  error: string | null;
  checkedAt?: string;
}): string {
  const when = input.checkedAt ?? new Date().toISOString();
  const err = input.error?.trim() || "no error detail";
  return [
    `[Lankawa ops] Adapter failure streak`,
    `source: ${input.sourceId}`,
    `consecutive_failures: ${input.consecutiveFailures}`,
    `error: ${err}`,
    `at: ${when}`,
  ].join("\n");
}

export async function sendOpsTelegramAlert(
  text: string,
): Promise<OpsTelegramResult> {
  const token = process.env.TELEGRAM_OPS_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_OPS_CHAT_ID?.trim();

  if (!token || !chatId) {
    return { sent: false, skippedReason: "env_not_configured" };
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          disable_web_page_preview: true,
        }),
      },
    );
    return { sent: response.ok, status: response.status };
  } catch {
    return { sent: false, skippedReason: "network_error" };
  }
}

export async function maybeAlertAdapterFailure(input: {
  sourceId: string;
  consecutiveFailures: number;
  error: string | null;
  checkedAt?: string;
}): Promise<OpsTelegramResult> {
  if (!shouldAlertFailureStreak(input.consecutiveFailures)) {
    return { sent: false, skippedReason: "below_threshold" };
  }

  return sendOpsTelegramAlert(formatAdapterFailureAlert(input));
}
