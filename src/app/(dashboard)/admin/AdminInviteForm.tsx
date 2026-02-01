'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AdminInviteForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Något gick fel' });
        return;
      }

      setMessage({ type: 'success', text: data.message || `Inbjudan skickad till ${email}` });
      setEmail('');
      setName('');
    } catch {
      setMessage({ type: 'error', text: 'Nätverksfel – försök igen' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Bjud in testare</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <Label htmlFor="invite-name" className="text-xs">
              Namn (valfritt)
            </Label>
            <Input
              id="invite-name"
              type="text"
              placeholder="Kalle Kalansen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="flex-1 space-y-1">
            <Label htmlFor="invite-email" className="text-xs">
              E-post
            </Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="test@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="shrink-0">
            {loading ? 'Skickar...' : 'Bjud in testare'}
          </Button>
        </form>

        {message && (
          <p
            className={`mt-3 text-sm ${
              message.type === 'success' ? 'text-green-600' : 'text-destructive'
            }`}
          >
            {message.text}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
