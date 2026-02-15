import { Resend } from 'resend';
import { RESEND_FROM_EMAIL, CONTACT_EMAIL } from '@/lib/constants';
import { formatDate, formatTimeRange } from '@/lib/utils/format';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface SendResult {
  success: boolean;
  error?: string;
}

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://kalaskoll.se';

/** Promotional footer for guest-facing emails (RSVP confirmation + party invitation). */
function promoFooterHtml(): string {
  const registerUrl = `${APP_BASE_URL}/register`;
  return `
    <div style="margin-top:24px;border-top:2px solid #2563eb;border-radius:0 0 12px 12px;padding:20px 24px;background:linear-gradient(180deg,#eff6ff 0%,#ffffff 100%);">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="vertical-align:middle;">
            <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#2563eb;">
              KalasKoll
            </p>
            <p style="margin:0;font-size:13px;color:#374151;line-height:1.4;">
              Planerar du eget barnkalas? Slipp kaoset &ndash; skapa snygga inbjudningar, samla OSA-svar och h&aring;ll koll p&aring; allergier. Helt gratis.
            </p>
            <a href="${registerUrl}" style="display:inline-block;margin-top:10px;background:#2563eb;color:#ffffff;padding:8px 18px;border-radius:6px;text-decoration:none;font-weight:600;font-size:13px;">
              Prova KalasKoll gratis
            </a>
          </td>
        </tr>
      </table>
    </div>`;
}

interface SendRsvpConfirmationParams {
  to: string;
  childName: string;
  childNames?: string[];
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
  childNames,
  partyChildName,
  attending,
  editUrl,
  partyDate,
  partyTime,
  venueName,
}: SendRsvpConfirmationParams): Promise<SendResult> {
  const names = childNames && childNames.length > 1 ? childNames : [childName];
  const displayNames = names.length > 1
    ? `${names.slice(0, -1).join(', ')} och ${names[names.length - 1]}`
    : names[0];
  const statusText = attending ? 'JA – ni kommer!' : 'NEJ – ni kan tyvärr inte komma';
  const statusEmoji = attending ? '🎉' : '😢';
  const subject = attending
    ? `Bekräftelse: ${displayNames} kommer på ${partyChildName}s kalas!`
    : `Bekräftelse: Svar registrerat för ${partyChildName}s kalas`;

  const html = `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f9fafb;color:#111827;">
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
            <td style="padding:4px 0;font-weight:600;font-size:14px;">${escapeHtml(displayNames)}</td>
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

    ${promoFooterHtml()}

    <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:12px;">
      &copy; ${new Date().getFullYear()} KalasKoll &ndash; Smarta inbjudningar f&ouml;r barnkalas
    </p>
  </div>
</body>
</html>`.trim();

  const resend = getResendClient();

  try {
    const { error } = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('[Email] RSVP confirmation failed:', { to, error: error.message });
      return { success: false, error: error.message };
    }

    console.log('[Email] RSVP confirmation sent:', { to });
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] RSVP confirmation error:', { to, error: msg });
    return { success: false, error: msg };
  }
}

export interface SendRsvpNotificationParams {
  to: string;
  ownerName: string;
  childNames: string[];
  attending: boolean;
  partyChildName: string;
  message?: string | null;
  guestListUrl: string;
  isEdit: boolean;
  stats: { attending: number; declined: number; pending: number };
}

export async function sendRsvpNotification({
  to,
  ownerName,
  childNames,
  attending,
  partyChildName,
  message,
  guestListUrl,
  isEdit,
  stats,
}: SendRsvpNotificationParams): Promise<SendResult> {
  const displayNames = childNames.length > 1
    ? `${childNames.slice(0, -1).join(', ')} och ${childNames[childNames.length - 1]}`
    : childNames[0];

  const statusText = attending ? 'JA – de kommer!' : 'NEJ – de kan inte komma';
  const statusEmoji = attending ? '✅' : '❌';
  const headerEmoji = isEdit ? '📝' : '🎉';
  const headerText = isEdit ? 'Ändrat OSA-svar!' : 'Nytt OSA-svar!';

  const subject = isEdit
    ? `${displayNames} ändrade sitt svar för ${partyChildName}s kalas`
    : `${displayNames} svarade ${attending ? 'JA' : 'NEJ'} till ${partyChildName}s kalas`;

  const greeting = ownerName ? `Hej ${escapeHtml(ownerName)}` : 'Hej';

  const messageRow = message
    ? `<tr>
        <td style="padding:4px 0;color:#6b7280;font-size:14px;vertical-align:top;">Meddelande:</td>
        <td style="padding:4px 0;font-size:14px;">${escapeHtml(message)}</td>
      </tr>`
    : '';

  const html = `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f9fafb;color:#111827;">
  <div style="max-width:480px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border-radius:12px;padding:32px 24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <h1 style="font-size:24px;margin:0 0 8px;color:#111827;">
        ${headerEmoji} ${headerText}
      </h1>
      <p style="font-size:16px;color:#6b7280;margin:0 0 24px;">
        ${greeting}, <strong>${escapeHtml(displayNames)}</strong> svarade ${attending ? 'JA' : 'NEJ'} till <strong>${escapeHtml(partyChildName)}s kalas</strong>.
      </p>

      <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:4px 0;color:#6b7280;font-size:14px;">Barn:</td>
            <td style="padding:4px 0;font-weight:600;font-size:14px;">${escapeHtml(displayNames)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#6b7280;font-size:14px;">Svar:</td>
            <td style="padding:4px 0;font-weight:600;font-size:14px;">${statusEmoji} ${statusText}</td>
          </tr>
          ${messageRow}
        </table>
      </div>

      <div style="background:#eff6ff;border-radius:8px;padding:16px;margin-bottom:24px;text-align:center;">
        <p style="margin:0;font-size:14px;color:#374151;">
          <strong>${stats.attending}</strong> kommer &middot; <strong>${stats.declined}</strong> nej &middot; <strong>${stats.pending}</strong> väntar svar
        </p>
      </div>

      <a href="${guestListUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
        Se gästlistan
      </a>
    </div>

    <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:12px;">
      &copy; ${new Date().getFullYear()} KalasKoll &ndash; Smarta inbjudningar f&ouml;r barnkalas
    </p>
  </div>
</body>
</html>`.trim();

  const resend = getResendClient();

  try {
    const { error } = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('[Email] RSVP notification failed:', { to, error: error.message });
      return { success: false, error: error.message };
    }

    console.log('[Email] RSVP notification sent:', { to, childNames, isEdit });
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] RSVP notification error:', { to, error: msg });
    return { success: false, error: msg };
  }
}

interface SendTesterInviteParams {
  to: string;
  name?: string;
  inviteUrl: string;
}

export async function sendTesterInvite({
  to,
  name,
  inviteUrl,
}: SendTesterInviteParams): Promise<SendResult> {
  const greeting = name ? `Hej ${escapeHtml(name)}` : 'Hej';

  const html = `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f9fafb;color:#111827;">
  <div style="max-width:480px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border-radius:12px;padding:32px 24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <h1 style="font-size:24px;margin:0 0 8px;color:#111827;">
        Du har blivit inbjuden att testa KalasKoll!
      </h1>
      <p style="font-size:16px;color:#6b7280;margin:0 0 24px;">
        ${greeting}, du har blivit utvald som testare.
      </p>

      <p style="font-size:14px;color:#374151;margin:0 0 16px;">
        KalasKoll hjälper dig skapa smarta inbjudningar till barnkalas med AI-genererade kort,
        QR-kod-baserad OSA och enkel allergihantering.
      </p>

      <p style="font-size:14px;color:#374151;margin:0 0 24px;">
        Klicka på knappen nedan för att aktivera ditt konto och sätta ett lösenord:
      </p>

      <a href="${inviteUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
        Aktivera mitt konto
      </a>

      <p style="font-size:12px;color:#6b7280;margin:24px 0 0;">
        Betan pågår t.o.m. 28 feb 2026. Testkonton raderas automatiskt 1 mars.
      </p>

      <p style="font-size:12px;color:#9ca3af;margin:8px 0 0;">
        Länken är giltig i 24 timmar. Om du inte förväntade dig detta mail kan du ignorera det.
      </p>
    </div>

    <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">
      Skickat via KalasKoll – Smarta inbjudningar för barnkalas
    </p>
  </div>
</body>
</html>`.trim();

  const resend = getResendClient();

  try {
    const { error } = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject: 'Du har blivit inbjuden att testa KalasKoll!',
      html,
    });

    if (error) {
      console.error('[Email] Tester invite failed:', { to, error: error.message });
      return { success: false, error: error.message };
    }

    console.log('[Email] Tester invite sent:', { to });
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Tester invite error:', { to, error: msg });
    return { success: false, error: msg };
  }
}

interface SendFeedbackResolvedParams {
  to: string;
  feedbackMessage: string;
}

export async function sendFeedbackResolved({
  to,
  feedbackMessage,
}: SendFeedbackResolvedParams): Promise<SendResult> {
  const truncated = feedbackMessage.length > 200
    ? feedbackMessage.slice(0, 200) + '…'
    : feedbackMessage;

  const html = `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f9fafb;color:#111827;">
  <div style="max-width:480px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border-radius:12px;padding:32px 24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <h1 style="font-size:24px;margin:0 0 8px;color:#111827;">
        Tack för din feedback!
      </h1>
      <p style="font-size:16px;color:#6b7280;margin:0 0 24px;">
        Vi har tittat på det du rapporterade och det ska vara åtgärdat nu.
      </p>

      <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="font-size:12px;color:#6b7280;margin:0 0 4px;font-weight:600;">Din feedback:</p>
        <p style="font-size:14px;color:#374151;margin:0;white-space:pre-wrap;">${escapeHtml(truncated)}</p>
      </div>

      <p style="font-size:14px;color:#374151;margin:0;">
        Om du upplever att problemet kvarstår eller har fler synpunkter — tveka inte att skicka ny feedback direkt i appen.
      </p>
    </div>

    <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">
      Skickat via KalasKoll – Smarta inbjudningar för barnkalas
    </p>
  </div>
</body>
</html>`.trim();

  const resend = getResendClient();

  try {
    const { error } = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject: 'Din feedback har åtgärdats – tack!',
      html,
    });

    if (error) {
      console.error('[Email] Feedback resolved failed:', { to, error: error.message });
      return { success: false, error: error.message };
    }

    console.log('[Email] Feedback resolved sent:', { to });
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Feedback resolved error:', { to, error: msg });
    return { success: false, error: msg };
  }
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
}: SendPartyInvitationParams): Promise<SendResult> {
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
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f9fafb;color:#111827;">
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

    ${promoFooterHtml()}

    <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:12px;">
      &copy; ${new Date().getFullYear()} KalasKoll &ndash; Smarta inbjudningar f&ouml;r barnkalas
    </p>
  </div>
</body>
</html>`.trim();

  const resend = getResendClient();

  try {
    const { error } = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('[Email] Invitation failed:', { to, error: error.message });
      return { success: false, error: error.message };
    }

    console.log('[Email] Invitation sent:', { to, child: partyChildName });
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Invitation error:', { to, error: msg });
    return { success: false, error: msg };
  }
}

interface SendContactEmailParams {
  name: string;
  email: string;
  message: string;
}

export async function sendContactEmail({
  name,
  email,
  message,
}: SendContactEmailParams): Promise<SendResult> {
  const html = `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f9fafb;color:#111827;">
  <div style="max-width:480px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border-radius:12px;padding:32px 24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <h1 style="font-size:24px;margin:0 0 8px;color:#111827;">
        Nytt kontaktmeddelande
      </h1>
      <p style="font-size:16px;color:#6b7280;margin:0 0 24px;">
        Från kontaktformuläret på kalaskoll.se
      </p>

      <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:4px 0;color:#6b7280;font-size:14px;">Namn:</td>
            <td style="padding:4px 0;font-weight:600;font-size:14px;">${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#6b7280;font-size:14px;">E-post:</td>
            <td style="padding:4px 0;font-size:14px;">${escapeHtml(email)}</td>
          </tr>
        </table>
      </div>

      <div style="background:#f3f4f6;border-radius:8px;padding:16px;">
        <p style="font-size:12px;color:#6b7280;margin:0 0 4px;font-weight:600;">Meddelande:</p>
        <p style="font-size:14px;color:#374151;margin:0;white-space:pre-wrap;">${escapeHtml(message)}</p>
      </div>
    </div>

    <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">
      Skickat via KalasKoll – Kontaktformulär
    </p>
  </div>
</body>
</html>`.trim();

  const resend = getResendClient();

  try {
    const { error } = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `Kontaktformulär: ${name}`,
      html,
    });

    if (error) {
      console.error('[Email] Contact form failed:', { email, error: error.message });
      return { success: false, error: error.message };
    }

    console.log('[Email] Contact form sent:', { from: email });
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Contact form error:', { email, error: msg });
    return { success: false, error: msg };
  }
}
