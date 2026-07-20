export interface BriefEmailBulletInput {
  bullets: string[];
  locale?: string;
  date?: string;
  unsubscribeUrl?: string;
}

function siteBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://lankawa.vercel.app";
  return raw.replace(/\/$/, "");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Simple monochrome HTML digest with deep links into Lankawa. */
export function buildBriefEmailHtml(input: BriefEmailBulletInput): string {
  const base = siteBaseUrl();
  const locale = ["en", "si", "ta"].includes(input.locale ?? "")
    ? (input.locale as string)
    : "en";
  const homeUrl = `${base}/${locale}`;
  const briefUrl = input.date
    ? `${base}/${locale}/brief/${input.date}`
    : `${base}/${locale}#brief`;
  const bullets = input.bullets
    .map((bullet) => bullet.trim())
    .filter(Boolean)
    .map(
      (bullet) =>
        `<li style="margin:0 0 10px;line-height:1.5;color:#111;">${escapeHtml(bullet)}</li>`,
    )
    .join("");

  const unsubscribeBlock = input.unsubscribeUrl
    ? `<p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#555;">
        <a href="${escapeHtml(input.unsubscribeUrl)}" style="color:#111;text-decoration:underline;">Unsubscribe</a>
        from the morning brief.
      </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="${escapeHtml(locale)}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Lankawa morning brief</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;color:#111;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #ddd;padding:28px 24px;">
          <tr>
            <td>
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#666;">Lankawa</p>
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:normal;color:#111;">Morning brief</h1>
              <ul style="margin:0;padding:0 0 0 18px;">
                ${bullets || `<li style="margin:0;line-height:1.5;color:#555;">No bullets for this brief.</li>`}
              </ul>
              <p style="margin:20px 0 0;font-size:14px;line-height:1.5;">
                <a href="${escapeHtml(briefUrl)}" style="color:#111;text-decoration:underline;">Open this brief</a>
                ·
                <a href="${escapeHtml(homeUrl)}" style="color:#111;text-decoration:underline;">Lankawa home</a>
              </p>
              ${unsubscribeBlock}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function getBriefSiteBaseUrl(): string {
  return siteBaseUrl();
}
