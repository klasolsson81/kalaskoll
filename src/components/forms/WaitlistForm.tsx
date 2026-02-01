'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check, Mail } from 'lucide-react';

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Något gick fel');
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="font-semibold text-lg">Du är på listan!</h3>
        <p className="text-muted-foreground mt-2">
          Vi meddelar dig på <strong>{email}</strong> så fort det finns plats.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot - hidden from users */}
      <input
        type="text"
        name="website"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="text-center mb-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
          <Mail className="h-6 w-6 text-amber-600" />
        </div>
        <h3 className="font-semibold">Gå med i väntelistan</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Få ett mail när beta öppnar igen.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="waitlist-email">E-post</Label>
        <Input
          id="waitlist-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="din@email.se"
          required
          disabled={status === 'submitting'}
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={status === 'submitting'}
      >
        {status === 'submitting' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'Meddela mig'
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Vi skickar bara ett mail när det finns plats. Ingen spam.
      </p>
    </form>
  );
}
