// visit-confirmation-email-template.js
// Exports a function that returns a modern HTML email for visit confirmations

export function html({ firstName, attendees, serviceTime, address, mapUrl, logoUrl }) {
  const defaultAddress = "51 Villa Monte Catini\n1 Elm Avenue\nCraigavon AH, 2191\nSandton\nSouth Africa";
  const addressHtml = String(address || defaultAddress).replace(/\n/g, "<br/>");

  return `
  <div style="font-family: 'Montserrat', Arial, sans-serif; background: #f7fafc; color: #222; padding: 0; margin: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f7fafc; padding: 0; margin: 0;">
      <tr>
        <td align="center">
          <table width="640" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 18px; margin: 36px 0; box-shadow: 0 6px 36px rgba(0,0,0,0.09);">
            <tr>
              <td style="padding: 48px 48px 32px 48px; text-align: center;">
                <img src="${logoUrl || "https://thelifeplace.org/logo4.svg"}" alt="The Life Place" width="128" style="margin-bottom: 20px;" />
                <h1 style="color: #B3282D; font-size: 2.25rem; margin: 0 0 12px 0; font-weight: 800; letter-spacing: -0.01em;">Your Visit is Booked!</h1>
                <p style="font-size: 1.15rem; line-height: 1.65; color: #333; margin: 0 0 22px 0;">Hi ${firstName || "there"},</p>
                <p style="font-size: 1.15rem; line-height: 1.65; color: #333; margin: 0 0 22px 0;">
                  Thank you for planning a visit to <b>The Life Place</b>! We’ve received your details${attendees ? ` for <b>${attendees}</b> attendee(s)` : ""}.
                </p>
                <p style="font-size: 1.15rem; line-height: 1.65; color: #333; margin: 0 0 22px 0;">
                  <b>Service Time:</b> ${serviceTime || "Sundays 9:00–11:00am"}<br/>
                  <b>Address:</b><br/>${addressHtml}
                </p>
                <a href="${mapUrl || "https://maps.app.goo.gl/xyz123"}" style="display:inline-block;margin:22px 0 0 0;padding:14px 30px;background:#B3282D;color:#fff;border-radius:12px;text-decoration:none;font-weight:700;font-size:1.05rem;" target="_blank" rel="noopener noreferrer">View on Google Maps</a>
                <hr style="margin:36px 0 22px 0; border:0; border-top:1px solid #eee;" />
                <p style="font-size: 1.05rem; line-height: 1.65; color: #4a4a4a; margin: 0 0 14px 0;">
                  If you have any questions or need to update your details, just reply to this email.<br/>
                  We can’t wait to welcome you!
                </p>
                <p style="font-size: 1.05rem; color: #666; margin: 0;">— The Life Place Team</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
}
