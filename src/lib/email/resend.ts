import { Resend } from 'resend';
import { RESEND_FROM_EMAIL } from '@/lib/constants';
import { formatDate, formatTimeRange } from '@/lib/utils/format';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

interface SendRsvpConfirmationParams {
  to: string;
  childName: string;
  partyChildName: string;
  attending: boolean;
  editUrl: string;
  partyDate: string;
  partyTime: string;
  venueName: string;
}

export async function sendRsvpConfirmation({
  to,
  childName,
  partyChildName,
  attending,
  editUrl,
  partyDate,
  partyTime,
  venueName,
}: SendRsvpConfirmationParams): Promise<void> {
  const statusText = attending ? 'JA – ni kommer!' : 'NEJ – ni kan tyvärr inte komma';
  const statusEmoji = attending ? '🎉' : '😢';
  const subject = attending
    ? `Bekräftelse: ${childName} kommer på ${partyChildName}s kalas!`
    : `Bekräftelse: Svar registrerat för ${partyChildName}s kalas`;

  const html = `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f9fafb;">
  <div style="max-width:480px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border-radius:12px;padding:32px 24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <h1 style="font-size:24px;margin:0 0 8px;color:#111827;">
        ${statusEmoji} Svar registrerat!
      </h1>
      <p style="font-size:16px;color:#6b7280;margin:0 0 24px;">
        Ditt svar för <strong>${escapeHtml(partyChildName)}s kalas</strong> har sparats.
      </p>

      <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:4px 0;color:#6b7280;font-size:14px;">Barn:</td>
            <td style="padding:4px 0;font-weight:600;font-size:14px;">${escapeHtml(childName)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#6b7280;font-size:14px;">Svar:</td>
            <td style="padding:4px 0;font-weight:600;font-size:14px;">${statusText}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#6b7280;font-size:14px;">Datum:</td>
            <td style="padding:4px 0;font-size:14px;">${partyDate}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#6b7280;font-size:14px;">Tid:</td>
            <td style="padding:4px 0;font-size:14px;">${partyTime}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#6b7280;font-size:14px;">Plats:</td>
            <td style="padding:4px 0;font-size:14px;">${escapeHtml(venueName)}</td>
          </tr>
        </table>
      </div>

      <p style="font-size:14px;color:#374151;margin:0 0 16px;">
        Behöver du ändra ditt svar? Klicka på knappen nedan:
      </p>

      <a href="${editUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
        Ändra ditt svar
      </a>

      <p style="font-size:12px;color:#9ca3af;margin:24px 0 0;">
        Denna länk är personlig – dela den inte med andra.
      </p>
    </div>

    <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">
      Skickat via KalasKoll – Smarta inbjudningar för barnkalas
    </p>
  </div>
</body>
</html>`.trim();

  const resend = getResendClient();

  await resend.emails.send({
    from: RESEND_FROM_EMAIL,
    to,
    subject,
    html,
  });
}

interface SendPartyInvitationParams {
  to: string;
  partyChildName: string;
  childAge: number;
  partyDate: string;
  partyTime: string;
  partyTimeEnd?: string | null;
  venueName: string;
  venueAddress?: string | null;
  theme?: string | null;
  description?: string | null;
  rsvpUrl: string;
  imageUrl?: string | null;
}

export async function sendPartyInvitation({
  to,
  partyChildName,
  childAge,
  partyDate,
  partyTime,
  partyTimeEnd,
  venueName,
  venueAddress,
  theme,
  description,
  rsvpUrl,
  imageUrl,
}: SendPartyInvitationParams): Promise<void> {
  const subject = `Du är inbjuden till ${partyChildName}s ${childAge}-årskalas!`;
  const timeDisplay = formatTimeRange(partyTime, partyTimeEnd);
  const dateDisplay = formatDate(partyDate);

  const imageSection = imageUrl
    ? `<div style="margin-bottom:24px;">
        <img src="${imageUrl}" alt="Inbjudan till ${escapeHtml(partyChildName)}s kalas" style="width:100%;border-radius:8px;" />
      </div>`
    : '';

  const addressRow = venueAddress
    ? `<tr>
        <td style="padding:4px 0;color:#6b7280;font-size:14px;">Adress:</td>
        <td style="padding:4px 0;font-size:14px;">${escapeHtml(venueAddress)}</td>
      </tr>`
    : '';

  const themeRow = theme
    ? `<tr>
        <td style="padding:4px 0;color:#6b7280;font-size:14px;">Tema:</td>
        <td style="padding:4px 0;font-size:14px;text-transform:capitalize;">${escapeHtml(theme)}</td>
      </tr>`
    : '';

  const descriptionSection = description
    ? `<p style="font-size:14px;color:#374151;margin:0 0 24px;">${escapeHtml(description)}</p>`
    : '';

  const html = `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f9fafb;">
  <div style="max-width:480px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border-radius:12px;padding:32px 24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <h1 style="font-size:24px;margin:0 0 8px;color:#111827;">
        🎉 ${escapeHtml(partyChildName)} fyller ${childAge} år!
      </h1>
      <p style="font-size:16px;color:#6b7280;margin:0 0 24px;">
        Du är varmt välkommen till kalaset!
      </p>

      ${imageSection}

      <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:4px 0;color:#6b7280;font-size:14px;">Datum:</td>
            <td style="padding:4px 0;font-weight:600;font-size:14px;">${dateDisplay}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#6b7280;font-size:14px;">Tid:</td>
            <td style="padding:4px 0;font-weight:600;font-size:14px;">kl ${timeDisplay}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#6b7280;font-size:14px;">Plats:</td>
            <td style="padding:4px 0;font-weight:600;font-size:14px;">${escapeHtml(venueName)}</td>
          </tr>
          ${addressRow}
          ${themeRow}
        </table>
      </div>

      ${descriptionSection}

      <p style="font-size:14px;color:#374151;margin:0 0 16px;">
        Klicka på knappen nedan för att svara på inbjudan:
      </p>

      <a href="${rsvpUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
        Svara på inbjudan
      </a>

      <p style="font-size:12px;color:#9ca3af;margin:24px 0 0;">
        Kan du inte klicka? Kopiera denna länk: ${rsvpUrl}
      </p>
    </div>

    <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">
      Skickat via KalasKoll – Smarta inbjudningar för barnkalas
    </p>
  </div>
</body>
</html>`.trim();

  const resend = getResendClient();

  await resend.emails.send({
    from: RESEND_FROM_EMAIL,
    to,
    subject,
    html,
  });
}
