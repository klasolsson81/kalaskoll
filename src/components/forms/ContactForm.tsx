'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check, Mail } from 'lucide-react';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, honeypot }),
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
        <h3 className="font-semibold text-lg">Tack för ditt meddelande!</h3>
        <p className="text-muted-foreground mt-2">
          Vi återkommer så snart vi kan.
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
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="text-center mb-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="font-semibold">Kontakta oss</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Har du frågor eller feedback? Skicka ett meddelande så hör vi av oss.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-name">Namn</Label>
        <Input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ditt namn"
          required
          maxLength={100}
          disabled={status === 'submitting'}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-email">E-post</Label>
        <Input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="din@email.se"
          required
          disabled={status === 'submitting'}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">Meddelande</Label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Skriv ditt meddelande här..."
          required
          maxLength={2000}
          rows={4}
          disabled={status === 'submitting'}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
        <p className="text-xs text-muted-foreground text-right">{message.length}/2000</p>
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
          'Skicka meddelande'
        )}
      </Button>
    </form>
  );
}
