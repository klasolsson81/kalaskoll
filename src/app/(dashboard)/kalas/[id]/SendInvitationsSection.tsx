'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QRCode } from '@/components/shared/QRCode';
import { APP_URL, SMS_MAX_PER_PARTY } from '@/lib/constants';
import { sendSmsInvitationSchema } from '@/lib/utils/validation';

type InviteMethod = 'email' | 'sms';

interface InvitedGuest {
  email: string | null;
  phone: string | null;
  invite_method: string;
  name: string | null;
  invited_at: string;
  hasResponded: boolean;
}

interface SmsUsage {
  smsCount: number;
  allowed: boolean;
}

interface SendInvitationsSectionProps {
  partyId: string;
  token: string;
  childName: string;
  invitedGuests: InvitedGuest[];
  smsUsage?: SmsUsage;
  isAdmin?: boolean;
}

export function SendInvitationsSection({
  partyId,
  token,
  childName,
  invitedGuests,
  smsUsage,
  isAdmin,
}: SendInvitationsSectionProps) {
  const router = useRouter();
  const [method, setMethod] = useState<InviteMethod>('email');
  const [emailsText, setEmailsText] = useState('');
  const [phonesText, setPhonesText] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; remainingSms?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const rsvpUrl = `${APP_URL}/r/${token}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(rsvpUrl);
    } catch {
      const input = document.createElement('input');
      input.value = rsvpUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    try {
      await navigator.share({
        title: `${childName}s kalas`,
        text: `Du är inbjuden till ${childName}s kalas! Svara här:`,
        url: rsvpUrl,
      });
    } catch {
      // User cancelled or share failed – no action needed
    }
  }

  async function handleSendEmail() {
    setError(null);
    setResult(null);

    const raw = emailsText
      .split(/[,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (raw.length === 0) {
      setError('Ange minst en e-postadress');
      return;
    }

    const emails = raw.map((email) => ({ email }));

    setSending(true);
    try {
      const res = await fetch('/api/invitation/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyId, emails }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Något gick fel');
        return;
      }

      setResult({ sent: data.sent, failed: data.failed });
      setEmailsText('');
      router.refresh();
    } catch {
      setError('Kunde inte skicka inbjudningar');
    } finally {
      setSending(false);
    }
  }

  async function handleSendSms() {
    setError(null);
    setResult(null);

    const raw = phonesText
      .split(/[,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (raw.length === 0) {
      setError('Ange minst ett telefonnummer');
      return;
    }

    // Client-side phone validation
    const validated = sendSmsInvitationSchema.safeParse({ partyId, phones: raw });
    if (!validated.success) {
      setError(validated.error.issues[0].message);
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/invitation/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyId, phones: raw }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Något gick fel');
        return;
      }

      setResult({ sent: data.sent, failed: data.failed, remainingSms: data.remainingSmsThisParty });
      setPhonesText('');
      router.refresh();
    } catch {
      setError('Kunde inte skicka SMS');
    } finally {
      setSending(false);
    }
  }

  function handleSend() {
    if (method === 'email') {
      handleSendEmail();
    } else {
      handleSendSms();
    }
  }

  const smsCount = smsUsage?.smsCount ?? 0;
  const smsAllowed = smsUsage?.allowed ?? false;
  const smsRemaining = SMS_MAX_PER_PARTY - smsCount;

  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dela inbjudan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick share buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copyLink} className="flex items-center gap-1.5">
            <span className="text-base">🔗</span>
            {copied ? 'Kopierad!' : 'Kopiera länk'}
          </Button>
          <Button
            variant={showQR ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowQR(!showQR)}
            className="flex items-center gap-1.5"
          >
            <span className="text-base">▣</span>
            QR-kod
          </Button>
          {canShare && (
            <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-1.5">
              <span className="text-base">📤</span>
              Dela...
            </Button>
          )}
        </div>

        {/* Inline QR code (toggled) */}
        {showQR && (
          <div className="flex flex-col items-center gap-3 rounded-lg border p-4">
            <QRCode token={token} size={180} />
            <code className="rounded bg-muted px-3 py-1.5 text-xs sm:text-sm break-all text-center">
              {rsvpUrl}
            </code>
          </div>
        )}

        {/* Divider */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-2">Skicka inbjudan:</p>
        </div>

        {/* Method toggle */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant={method === 'email' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setMethod('email'); setError(null); setResult(null); }}
          >
            E-post
          </Button>
          <Button
            type="button"
            variant={method === 'sms' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setMethod('sms'); setError(null); setResult(null); }}
            disabled={!smsAllowed && !isAdmin}
            title={!smsAllowed && !isAdmin ? 'Du har redan använt SMS för ett annat kalas denna månad' : undefined}
          >
            SMS
          </Button>
        </div>

        {!smsAllowed && !isAdmin && method === 'email' && (
          <p className="text-xs text-muted-foreground">
            SMS ej tillgängligt – redan använt för ett annat kalas denna månad.
          </p>
        )}

        {method === 'email' ? (
          <div className="space-y-2">
            <Label htmlFor="inviteEmails">E-postadresser</Label>
            <textarea
              id="inviteEmails"
              value={emailsText}
              onChange={(e) => setEmailsText(e.target.value)}
              rows={3}
              placeholder="anna@example.com, erik@example.com&#10;Eller en per rad..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              Separera med komma eller ny rad
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="invitePhones">Telefonnummer</Label>
            <textarea
              id="invitePhones"
              value={phonesText}
              onChange={(e) => setPhonesText(e.target.value)}
              rows={3}
              placeholder="0701234567, 0709876543&#10;Eller ett per rad..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {isAdmin ? (
              <p className="text-xs text-muted-foreground">
                Superadmin — inga SMS-begränsningar
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {smsCount} av {SMS_MAX_PER_PARTY} SMS använda för detta kalas
                {smsRemaining > 0 && ` (${smsRemaining} kvar)`}
              </p>
            )}
          </div>
        )}

        <Button onClick={handleSend} disabled={sending} className="w-full">
          {sending
            ? 'Skickar...'
            : method === 'email'
              ? 'Skicka inbjudan via e-post'
              : 'Skicka inbjudan via SMS'}
        </Button>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {result && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
            {result.failed === 0
              ? `${result.sent} ${result.sent === 1 ? 'inbjudan skickad' : 'inbjudningar skickade'}`
              : `${result.sent} av ${result.sent + result.failed} skickade (${result.failed} misslyckades)`}
          </div>
        )}

        {invitedGuests.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium">Inbjudna ({invitedGuests.length})</p>
            <ul className="space-y-1.5">
              {invitedGuests.map((g) => {
                const key = g.email ?? g.phone ?? g.invited_at;
                const isSms = g.invite_method === 'sms';
                const display = isSms ? g.phone : (g.name || g.email);
                return (
                  <li key={key} className="flex items-center gap-2 text-sm">
                    <span className="text-base" title={isSms ? 'SMS' : 'E-post'}>
                      {isSms ? '📱' : '✉️'}
                    </span>
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        g.hasResponded ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                    <span>{display}</span>
                    {!isSms && g.name && g.email && (
                      <span className="text-muted-foreground">{g.email}</span>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {g.hasResponded ? 'Svarat' : 'Ej svarat'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
