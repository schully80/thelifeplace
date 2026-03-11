export function teamHtml({
  name,
  userEmail,
  requestText,
  consent,
}: { name: string; userEmail: string; requestText: string; consent: string }) {
  return `<!DOCTYPE html>
  <html>
    <head>
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap" rel="stylesheet" />
    </head>
    <body style="margin:0;padding:0;background:#f6f7fb;font-family:'Montserrat';color:#1f2937;font-size:16px;line-height:1.6;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f6f7fb;padding:28px 0;">
        <tr>
          <td align="center">
            <table width="640" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">
              <tr>
                <td style="background:#b3282d;color:#ffffff;padding:20px 28px;font-size:20px;font-weight:700;letter-spacing:0.2px;">
                  New Prayer Request
                </td>
              </tr>
              <tr>
                <td style="padding:26px 28px;">
                  <p style="margin:0 0 10px;font-weight:700;color:#111827;">Name: <strong>${escapeHtml(name)}</strong></p>
                  <p style="margin:0 0 10px;">Email: ${userEmail ? `<a href="mailto:${escapeHtml(userEmail)}" style="color:#b3282d;text-decoration:none;font-weight:600;">${escapeHtml(userEmail)}</a>` : "not provided"}</p>
                  <p style="margin:0 0 18px;color:#4b5563;">Consent: ${escapeHtml(consent)}</p>
                  <div style="margin-top:8px;padding:18px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;">
                    <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#b3282d;">Request</p>
                    <p style="margin:0;font-size:15px;line-height:1.65;color:#374151;white-space:pre-wrap;">${escapeHtml(requestText || "(empty)")}</p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

export function confirmText({ name, requestText }: { name: string; requestText: string }) {
  return `Hi ${name || "friend"},

We’ve received your prayer request and our team is praying for you.

Your request:
${requestText || "(empty)"}

— The Life Place Prayer Team`;
}

export function confirmHtml({ name, requestText }: { name: string; requestText: string }) {
  return `<!DOCTYPE html>
  <html>
    <head>
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap" rel="stylesheet" />
    </head>
    <body style="margin:0;padding:0;background:#f6f7fb;font-family:'Montserrat';color:#1f2937;font-size:16px;line-height:1.6;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f6f7fb;padding:28px 0;">
        <tr>
          <td align="center">
            <table width="640" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">
              <tr>
                <td style="background:#b3282d;color:#ffffff;padding:20px 28px;font-size:20px;font-weight:700;letter-spacing:0.2px;">
                  We received your prayer request
                </td>
              </tr>
              <tr>
                <td style="padding:26px 28px;font-size:16px;line-height:1.6;color:#374151;">
                  <p style="margin:0 0 14px;font-weight:700;color:#111827;">Hi ${escapeHtml(name || "friend")},</p>
                  <p style="margin:0 0 16px;">We’ve received your prayer request and our team is praying for you.</p>
                  <div style="margin:14px 0;padding:18px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;">
                    <p style="margin:0 0 8px;font-weight:700;color:#b3282d;">Your request</p>
                    <p style="margin:0;white-space:pre-wrap;line-height:1.65;">${escapeHtml(requestText || "(empty)")}</p>
                  </div>
                  <div style="margin:14px 0;padding:14px;background:#fff5f5;border:1px solid #fbd5d5;border-radius:12px;">
                    <p style="margin:0 0 6px;font-weight:700;color:#b3282d;">Here's more good news</p>
                    <p style="margin:0 0 6px;color:#374151;">Jesus is also praying for you.</p>
                    <p style="margin:0 0 4px;font-size:14px;color:#4b5563; text-align:center;">Therefore he is able, once and forever, to save those who come to God through him. He lives forever to intercede with God on their behalf.</p>
                    <p style="margin:0;font-size:14px;color:#4b5563;text-align:center;font-weight:600;">Hebrews 7:25 (NLT)</p>
                  </div>
                  <p style="margin:10px 0 4px;font-weight:700;color:#b3282d;">— The Life Place Prayer Team</p>
                  <p style="margin:0;font-size:14px;color:#4b5563;">Want to know more about us? Visit <a href="https://thelifeplace.org" style="color:#b3282d;text-decoration:none;font-weight:700;">thelifeplace.org</a></p>
                  <p style="margin:0;font-size:14px;color:#4b5563;">Come. See. <span style="font-weight:700;color:#b3282d;">Jesus</span></p>

                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

export function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
