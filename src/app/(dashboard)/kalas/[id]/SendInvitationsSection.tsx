'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InvitedGuest {
  email: string;
  name: string | null;
  invited_at: string;
  hasResponded: boolean;
}

interface SendInvitationsSectionProps {
  partyId: string;
  invitedGuests: InvitedGuest[];
}

export function SendInvitationsSection({
  partyId,
  invitedGuests,
}: SendInvitationsSectionProps) {
  const [emailsText, setEmailsText] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
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
    } catch {
      setError('Kunde inte skicka inbjudningar');
    } finally {
      setSending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skicka inbjudan via e-post</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <Button onClick={handleSend} disabled={sending} className="w-full">
          {sending ? 'Skickar...' : 'Skicka inbjudan'}
        </Button>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {result && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
            Skickat till {result.sent} av {result.sent + result.failed}
            {result.failed > 0 && ` (${result.failed} misslyckades)`}
          </div>
        )}

        {invitedGuests.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium">Inbjudna ({invitedGuests.length})</p>
            <ul className="space-y-1.5">
              {invitedGuests.map((g) => (
                <li key={g.email} className="flex items-center gap-2 text-sm">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      g.hasResponded ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                  <span>{g.name || g.email}</span>
                  {g.name && (
                    <span className="text-muted-foreground">{g.email}</span>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {g.hasResponded ? 'Svarat' : 'Ej svarat'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
